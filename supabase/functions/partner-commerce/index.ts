import { corsHeaders, handleError, json, requireRole, adminClient, loadStripeConfig } from '../_shared/core.ts';
import { syncAdditionalServicesToStripe } from '../_shared/additional-services-stripe.ts';
import { createDeferredAddonSubscriptions } from '../_shared/deferred-addon-subscriptions.ts';
import {
  loadEmailTemplates,
  mergePartnerClientTemplates,
  PARTNER_CLIENT_EMAIL_CATALOG,
  sendPartnerClientTemplatedEmail,
} from '../_shared/email-templates.ts';
import {
  buildPaymentProfilePatch,
  validatePaymentProfileForSubmit,
} from '../_shared/partner-payment-profile.ts';
import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno';

const MAX_PARTNER_ADDITIONAL_SERVICES = 4;

function assertAdditionalServicesLimit(services: unknown[]) {
  if (services.length > MAX_PARTNER_ADDITIONAL_SERVICES) {
    throw new Error(`ADDITIONAL_SERVICES_LIMIT_${MAX_PARTNER_ADDITIONAL_SERVICES}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { profile, supabase } = await requireRole(req, ['partner', 'super_admin']);
    const { action, payload = {} } = await req.json();
    const partnerId = profile.partner_id || payload.partnerId;
    if (!partnerId && profile.role !== 'super_admin') throw new Error('PARTNER_NOT_ASSIGNED');

    if (action === 'listCatalog') {
      const { data, error } = await supabase.from('catalog_products').select('*').eq('active', true).order('name');
      if (error) throw error;
      return json({ products: data });
    }

    if (action === 'listClients') {
      const { data, error } = await supabase.from('partner_clients').select('*').eq('partner_id', partnerId).order('created_at', { ascending: false });
      if (error) throw error;
      return json({ clients: data });
    }

    if (action === 'createClient') {
      const displayName = String(payload.company_name || payload.name || '').trim();
      if (!displayName) throw new Error('CLIENT_NAME_REQUIRED');

      const clientRow = {
        name: displayName,
        email: payload.email || null,
        phone: payload.phone || null,
        status: payload.status || 'pending',
        company_name: payload.company_name || displayName,
        logo_url: payload.logo_url || null,
        industry: payload.industry || null,
        website: payload.website || null,
        contact_name: payload.contact_name || null,
        contact_role: payload.contact_role || null,
        country: payload.country || null,
        city: payload.city || null,
        address: payload.address || null,
        notes: payload.notes || null,
      };

      if (payload.id) {
        const { data, error } = await supabase
          .from('partner_clients')
          .update(clientRow)
          .eq('id', payload.id)
          .eq('partner_id', partnerId)
          .select()
          .single();
        if (error) throw error;

        await supabase.from('audit_logs').insert({
          actor_user_id: profile.id,
          action: 'partner.client_updated',
          entity_type: 'partner_client',
          entity_id: data.id,
          metadata: { partnerId },
        });

        return json({ client: data });
      }

      const { data, error } = await supabase.from('partner_clients').insert({
        partner_id: partnerId,
        ...clientRow,
      }).select().single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'partner.client_created',
        entity_type: 'partner_client',
        entity_id: data.id,
        metadata: { partnerId, status: clientRow.status },
      });

      return json({ client: data }, 201);
    }

    if (action === 'saveOffer') {
      const { data: product, error: productError } = await supabase.from('catalog_products').select('*').eq('id', payload.productId).single();
      if (productError) throw productError;
      if (Number(payload.retailPrice) < Number(product.wholesale_price)) throw new Error('PRICE_BELOW_WHOLESALE');

      const offerRow: Record<string, unknown> = {
        partner_id: partnerId,
        product_id: payload.productId,
        retail_price: payload.retailPrice,
        display_name: payload.displayName ? String(payload.displayName).trim() : null,
        display_description: payload.displayDescription ? String(payload.displayDescription).trim() : null,
        currency: product.currency,
        active: payload.active !== false,
        updated_at: new Date().toISOString(),
      };
      if (payload.ghlPriceId !== undefined) {
        offerRow.ghl_price_id = payload.ghlPriceId
          ? String(payload.ghlPriceId).trim()
          : null;
      }

      const { data, error } = await supabase.from('partner_offers').upsert(
        offerRow,
        { onConflict: 'partner_id,product_id' },
      ).select().single();
      if (error) throw error;
      return json({ offer: data });
    }

    if (action === 'listPartnerCatalog') {
      const { data: products, error: productsError } = await supabase
        .from('catalog_products')
        .select('*')
        .eq('active', true)
        .order('name');
      if (productsError) throw productsError;

      const { data: offers, error: offersError } = await supabase
        .from('partner_offers')
        .select('id, product_id, retail_price, display_name, display_description, currency, active')
        .eq('partner_id', partnerId);
      if (offersError) throw offersError;

      const offerByProduct = new Map(
        (offers || []).map((offer) => [String(offer.product_id), offer]),
      );

      const rows = (products || []).map((product) => {
        const offer = offerByProduct.get(String(product.id));
        return {
          id: product.id,
          catalogName: product.name,
          catalogDescription: product.description,
          catalogIncludes: product.includes || '',
          wholesalePrice: product.wholesale_price,
          suggestedPrice: product.suggested_price,
          currency: product.currency,
          billingType: product.billing_type,
          interval: product.interval,
          offerId: offer?.id || null,
          displayName: offer?.display_name || product.name,
          displayDescription: offer?.display_description || product.description || '',
          retailPrice: offer?.retail_price ?? product.suggested_price ?? null,
          published: Boolean(offer?.active && offer?.retail_price != null),
        };
      });

      return json({ products: rows });
    }

    if (action === 'listOffers') {
      const { data, error } = await supabase
        .from('partner_offers')
        .select(`
          id,
          retail_price,
          display_name,
          display_description,
          currency,
          active,
          catalog_products:product_id (
            id,
            name,
            description,
            interval,
            billing_type,
            currency,
            suggested_price,
            active
          )
        `)
        .eq('partner_id', partnerId)
        .eq('active', true);

      if (error) throw error;
      return json({ offers: data || [] });
    }

    if (action === 'getBranding') {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, slug, status, branding, social_settings')
        .eq('id', partnerId)
        .single();
      if (error) throw error;
      return json({ partner: data });
    }

    if (action === 'getPartnerEmailTemplates') {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, branding')
        .eq('id', partnerId)
        .single();
      if (error) throw error;

      const branding = (data?.branding || {}) as Record<string, unknown>;
      const brand = (branding.brand || {}) as Record<string, string>;
      const emailSettings = (branding.emailSettings || brand.emailSettings || {}) as Record<string, string>;
      const storedTemplates = (branding.emailTemplates || brand.emailTemplates || {}) as Record<string, Partial<{ subject: string; html: string; enabled: boolean }>>;
      const platformTemplates = await loadEmailTemplates(supabase);
      const merged = mergePartnerClientTemplates(storedTemplates, platformTemplates);

      const partnerName = String(brand.businessName || branding.name || data?.name || '').trim();
      const templates = PARTNER_CLIENT_EMAIL_CATALOG.map(meta => ({
        ...meta,
        ...merged[meta.id],
      }));

      return json({
        emailSettings: {
          fromName: emailSettings.fromName || partnerName || '',
          replyTo: emailSettings.replyTo || brand.contactEmail || '',
        },
        templates,
      });
    }

    if (action === 'savePartnerEmailTemplates') {
      const { data: existingPartner, error: readError } = await supabase
        .from('partners')
        .select('branding')
        .eq('id', partnerId)
        .single();
      if (readError) throw readError;

      const existingBranding = (existingPartner?.branding || {}) as Record<string, unknown>;
      const brand = (existingBranding.brand || {}) as Record<string, string>;
      const emailSettingsInput = (payload.emailSettings || {}) as Record<string, string>;
      const templatesInput = (payload.templates || {}) as Record<string, Partial<{ subject: string; html: string; enabled: boolean }>>;

      const emailSettings = {
        fromName: String(emailSettingsInput.fromName || brand.businessName || existingBranding.name || '').trim(),
        replyTo: String(emailSettingsInput.replyTo || brand.contactEmail || '').trim().toLowerCase(),
      };

      const branding = {
        ...existingBranding,
        emailSettings,
        emailTemplates: templatesInput,
      };

      const { data, error } = await supabase
        .from('partners')
        .update({
          branding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId)
        .select('id, name, branding')
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'partner.email_templates_saved',
        entity_type: 'partner',
        entity_id: partnerId,
        metadata: { partnerId, templateIds: Object.keys(templatesInput) },
      });

      return json({ partner: data });
    }

    if (action === 'sendPartnerEmailTemplateTest') {
      const templateId = String(payload.templateId || '').trim();
      if (!templateId) throw new Error('TEMPLATE_ID_REQUIRED');

      const testTo = String(payload.to || profile.email || '').trim().toLowerCase();
      if (!testTo) throw new Error('TEST_RECIPIENT_REQUIRED');

      const result = await sendPartnerClientTemplatedEmail(supabase, String(partnerId), templateId, {
        to: testTo,
        variables: {
          clientName: 'Cliente Demo S.A.S.',
          clientEmail: 'cliente@ejemplo.com',
          productName: 'Plan Profesional',
          amount: '199.00',
          currency: 'USD',
        },
      });

      if ((result as { skipped?: boolean }).skipped) {
        throw new Error(String((result as { reason?: string }).reason || 'SEND_FAILED'));
      }

      return json({ ok: true, to: testTo, templateId });
    }

    if (action === 'saveAdditionalServices') {
      const services = Array.isArray(payload.additionalServices) ? payload.additionalServices : [];
      assertAdditionalServicesLimit(services);

      let syncedServices: Array<Record<string, unknown>>;
      try {
        syncedServices = await syncAdditionalServicesToStripe(
          services as Array<Record<string, unknown>>,
          String(partnerId),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
        throw new Error(`ADDITIONAL_SERVICE_STRIPE:${message}`);
      }

      const { data: partner, error: readError } = await supabase
        .from('partners')
        .select('branding')
        .eq('id', partnerId)
        .single();
      if (readError) throw readError;

      const branding = {
        ...(partner.branding || {}),
        additionalServices: syncedServices,
      };

      const { data, error } = await supabase
        .from('partners')
        .update({
          branding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnerId)
        .select('id, name, slug, status, branding, social_settings')
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'partner.additional_services_saved',
        entity_type: 'partner',
        entity_id: partnerId,
        metadata: {
          partnerId,
          serviceCount: syncedServices.length,
          stripeLinkedCount: syncedServices.filter(
            (service) => Boolean(service.stripe_price_id),
          ).length,
        },
      });

      return json({ partner: data });
    }

    if (action === 'repairDeferredAddonSubscriptions') {
      const sessionId = String(payload.checkoutSessionId || '').trim();
      if (!sessionId) throw new Error('CHECKOUT_SESSION_ID_REQUIRED');

      const { secretKey: stripeSecret } = await loadStripeConfig(supabase);
      if (!stripeSecret) throw new Error('STRIPE_NOT_CONFIGURED');

      const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        throw new Error('CHECKOUT_NOT_PAID');
      }

      const sessionPartnerId = String(session.metadata?.partner_id || '');
      if (profile.role !== 'super_admin' && sessionPartnerId !== String(partnerId)) {
        throw new Error('FORBIDDEN');
      }

      const subscriptions = await createDeferredAddonSubscriptions(
        stripe,
        adminClient(),
        session,
      );

      return json({ subscriptions });
    }

    if (action === 'saveBranding') {
      const { data: existingPartner, error: readError } = await supabase
        .from('partners')
        .select('branding, social_settings')
        .eq('id', partnerId)
        .single();
      if (readError) throw readError;

      const existingBranding = (existingPartner?.branding || {}) as Record<string, unknown>;
      const brand = payload.brand !== undefined ? payload.brand : (existingBranding.brand || {});
      const funnel = payload.funnel !== undefined ? payload.funnel : (existingBranding.funnel || {});
      const checkout = payload.checkout !== undefined ? payload.checkout : (existingBranding.checkout || {});
      const terms = payload.terms !== undefined ? payload.terms : (existingBranding.terms || {});
      const additionalServices = Array.isArray(payload.additionalServices)
        ? payload.additionalServices
        : (Array.isArray(existingBranding.additionalServices) ? existingBranding.additionalServices : []);
      if (payload.additionalServices !== undefined) {
        assertAdditionalServicesLimit(additionalServices);
      }
      const productOverrides = payload.productOverrides !== undefined
        ? payload.productOverrides
        : (existingBranding.productOverrides || {});
      const brandRecord = (brand || {}) as Record<string, unknown>;
      const emailSettings = payload.emailSettings !== undefined
        ? payload.emailSettings
        : (existingBranding.emailSettings || brandRecord.emailSettings || {});
      const emailTemplates = payload.emailTemplates !== undefined
        ? payload.emailTemplates
        : (existingBranding.emailTemplates || brandRecord.emailTemplates || {});

      const branding = {
        ...existingBranding,
        brand,
        funnel,
        checkout,
        terms,
        additionalServices,
        productOverrides,
        emailSettings,
        emailTemplates,
        name: brand.businessName || payload.name || existingBranding.name || null,
        domain: payload.domain || brand.websiteUrl || existingBranding.domain || null,
        logoUrl: brand.logoUrl || payload.logoUrl || existingBranding.logoUrl || null,
        primaryColor: brand.primaryColor || payload.primaryColor || existingBranding.primaryColor || '#7C3AED',
      };

      const social = {
        metaPixelId: payload.metaPixelId || null,
        facebookUrl: brand.facebookUrl || payload.facebookUrl || null,
        instagramUrl: brand.instagramUrl || payload.instagramUrl || null,
        linkedinUrl: brand.linkedinUrl || null,
        tiktokUrl: brand.tiktokUrl || payload.tiktokUrl || null,
      };

      const partnerPatch: Record<string, unknown> = {
        branding,
        social_settings: social,
        updated_at: new Date().toISOString(),
      };

      if (brand.businessName) {
        partnerPatch.name = String(brand.businessName).trim();
      }

      const { data, error } = await supabase
        .from('partners')
        .update(partnerPatch)
        .eq('id', partnerId)
        .select('id, name, slug, status, branding, social_settings')
        .single();
      if (error) throw error;
      return json({ partner: data });
    }

    if (action === 'getPaymentProfile') {
      if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');
      const { data, error } = await supabase
        .from('partner_payment_profiles')
        .select('*')
        .eq('partner_id', partnerId)
        .maybeSingle();
      if (error) throw error;
      return json({ profile: data });
    }

    if (action === 'savePaymentProfile') {
      if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');

      const { data: existing, error: existingError } = await supabase
        .from('partner_payment_profiles')
        .select('*')
        .eq('partner_id', partnerId)
        .maybeSingle();
      if (existingError) throw existingError;

      if (existing?.status === 'approved') {
        throw new Error('PAYMENT_PROFILE_LOCKED');
      }

      const patch = buildPaymentProfilePatch(payload);
      const nextStatus = existing?.status === 'pending_review'
        ? 'pending_review'
        : (existing?.status === 'rejected' || existing?.status === 'needs_changes'
          ? existing.status
          : 'draft');

      const row = {
        partner_id: partnerId,
        ...patch,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('partner_payment_profiles')
        .upsert(row, { onConflict: 'partner_id' })
        .select('*')
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'partner.payment_profile_saved',
        entity_type: 'partner_payment_profile',
        entity_id: data.id,
        metadata: { partnerId, status: data.status },
      });

      return json({ profile: data });
    }

    if (action === 'submitPaymentProfile') {
      if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');

      const { data: existing, error: existingError } = await supabase
        .from('partner_payment_profiles')
        .select('*')
        .eq('partner_id', partnerId)
        .maybeSingle();
      if (existingError) throw existingError;

      if (existing?.status === 'approved') {
        throw new Error('PAYMENT_PROFILE_LOCKED');
      }
      if (existing?.status === 'pending_review') {
        throw new Error('PAYMENT_PROFILE_ALREADY_SUBMITTED');
      }

      const patch = buildPaymentProfilePatch({
        ...(existing || {}),
        ...payload,
        legal_profile: payload.legal_profile ?? payload.legalProfile ?? existing?.legal_profile,
        backup_bank: payload.backup_bank ?? payload.backupBank ?? existing?.backup_bank,
        us_bank: payload.us_bank ?? payload.usBank ?? existing?.us_bank,
        provider_details: payload.provider_details ?? payload.providerDetails ?? existing?.provider_details,
        wizard_state: {
          ...(existing?.wizard_state || {}),
          ...(payload.wizard_state || payload.wizardState || {}),
          paymentMethodConfirmed: true,
          submitted: true,
        },
        has_us_bank: payload.has_us_bank ?? payload.hasUSBank ?? existing?.has_us_bank,
      });

      if (payload.finalConfirmation !== true) {
        throw new Error('PAYMENT_PROFILE_CONFIRMATION_REQUIRED');
      }

      validatePaymentProfileForSubmit({
        legal_profile: patch.legal_profile as Record<string, unknown>,
        backup_bank: patch.backup_bank as Record<string, unknown>,
        has_us_bank: patch.has_us_bank,
        us_bank: patch.us_bank as Record<string, unknown>,
        payment_route: patch.payment_route,
        wizard_state: patch.wizard_state as Record<string, unknown>,
      });

      const row = {
        partner_id: partnerId,
        ...patch,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        review_notes: null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('partner_payment_profiles')
        .upsert(row, { onConflict: 'partner_id' })
        .select('*')
        .single();
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'partner.payment_profile_submitted',
        entity_type: 'partner_payment_profile',
        entity_id: data.id,
        metadata: {
          partnerId,
          paymentRoute: data.payment_route,
        },
      });

      return json({ profile: data });
    }

    if (action === 'listSupportTickets') {
      if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');
      let query = supabase
        .from('support_tickets')
        .select('id, partner_id, subject, priority, status, last_message_at, last_message_by, created_at, updated_at, resolved_at, closed_at')
        .eq('partner_id', partnerId)
        .order('last_message_at', { ascending: false });
      if (payload.status) query = query.eq('status', payload.status);
      const { data, error } = await query;
      if (error) throw error;
      return json({ tickets: data || [] });
    }

    if (action === 'getSupportTicket') {
      if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');
      const ticketId = String(payload.ticketId || '').trim();
      if (!ticketId) throw new Error('SUPPORT_TICKET_REQUIRED');

      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .eq('partner_id', partnerId)
        .single();
      if (ticketError) throw ticketError;

      const { data: messages, error: messagesError } = await supabase
        .from('support_ticket_messages')
        .select('id, ticket_id, author_user_id, author_role, body, created_at')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      if (messagesError) throw messagesError;

      return json({ ticket, messages: messages || [] });
    }

    if (action === 'createSupportTicket') {
      if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');
      const subject = String(payload.subject || '').trim();
      const body = String(payload.message || payload.body || '').trim();
      const priority = String(payload.priority || 'medium');
      if (!subject || !body) throw new Error('SUPPORT_TICKET_FIELDS_REQUIRED');
      if (!['low', 'medium', 'high'].includes(priority)) throw new Error('INVALID_SUPPORT_PRIORITY');

      const now = new Date().toISOString();
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          partner_id: partnerId,
          created_by: profile.id,
          subject,
          priority,
          status: 'open',
          last_message_at: now,
          last_message_by: 'partner',
          created_at: now,
          updated_at: now,
        })
        .select('*')
        .single();
      if (ticketError) throw ticketError;

      const { data: message, error: messageError } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticket.id,
          author_user_id: profile.id,
          author_role: 'partner',
          body,
          created_at: now,
        })
        .select('*')
        .single();
      if (messageError) throw messageError;

      await supabase.from('platform_notifications').insert({
        partner_id: null,
        recipient_role: 'super_admin',
        type: 'support_ticket_created',
        title: 'Nuevo ticket de soporte',
        body: subject,
        metadata: { ticketId: ticket.id, partnerId, priority },
      });

      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'support.ticket_created',
        entity_type: 'support_ticket',
        entity_id: ticket.id,
        metadata: { partnerId, priority },
      });

      return json({ ticket, message }, 201);
    }

    if (action === 'replySupportTicket') {
      if (!partnerId) throw new Error('PARTNER_NOT_ASSIGNED');
      const ticketId = String(payload.ticketId || '').trim();
      const body = String(payload.message || payload.body || '').trim();
      if (!ticketId || !body) throw new Error('SUPPORT_TICKET_FIELDS_REQUIRED');

      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .eq('partner_id', partnerId)
        .single();
      if (ticketError) throw ticketError;
      if (ticket.status === 'closed') throw new Error('SUPPORT_TICKET_CLOSED');

      const now = new Date().toISOString();
      const { data: message, error: messageError } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          author_user_id: profile.id,
          author_role: 'partner',
          body,
          created_at: now,
        })
        .select('*')
        .single();
      if (messageError) throw messageError;

      const nextStatus = ticket.status === 'waiting_partner' || ticket.status === 'resolved'
        ? 'open'
        : ticket.status;

      const { data: updated, error: updateError } = await supabase
        .from('support_tickets')
        .update({
          status: nextStatus,
          last_message_at: now,
          last_message_by: 'partner',
          updated_at: now,
          resolved_at: nextStatus === 'open' ? null : ticket.resolved_at,
        })
        .eq('id', ticketId)
        .select('*')
        .single();
      if (updateError) throw updateError;

      await supabase.from('platform_notifications').insert({
        partner_id: null,
        recipient_role: 'super_admin',
        type: 'support_ticket_reply',
        title: 'Respuesta de partner en ticket',
        body: ticket.subject,
        metadata: { ticketId, partnerId },
      });

      return json({ ticket: updated, message });
    }

    throw new Error('UNKNOWN_ACTION');
  } catch (error) {
    return handleError(error);
  }
});
