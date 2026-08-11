const PARTNER_CENTER_URL = '/forms/NOVO_Partner_Center.html?embed=1';

export default function PartnerRegistrationEmbed() {
  return (
    <div className="partner-center-embed">
      <iframe
        title="NOVO Partner Center"
        src={PARTNER_CENTER_URL}
        className="partner-center-embed__frame"
      />
    </div>
  );
}
