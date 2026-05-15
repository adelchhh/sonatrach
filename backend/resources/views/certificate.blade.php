<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Helvetica", "Arial", sans-serif;
    color: #0A0A0A;
    background: #FFFFFF;
    width: 297mm;
    height: 210mm;
    position: relative;
    overflow: hidden;
  }
  .frame {
    position: absolute;
    inset: 12mm;
    border: 2px solid #0A0A0A;
    padding: 18mm 22mm;
  }
  .ribbon {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 6mm;
    background: #ED8D31;
  }
  .ribbon-end {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 6mm;
    background: #0A0A0A;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8mm;
    border-bottom: 1px solid #E5E5E5;
  }
  .brand {
    display: flex;
    align-items: center;
  }
  .logo {
    width: 18mm; height: 18mm;
    background: #ED8D31;
    color: white;
    font-weight: 900;
    font-size: 24pt;
    text-align: center;
    line-height: 18mm;
    margin-right: 6mm;
  }
  .brand-name {
    display: inline-block;
    vertical-align: middle;
    font-weight: 900;
    letter-spacing: 0.3em;
    font-size: 16pt;
    color: #0A0A0A;
  }
  .ref {
    text-align: right;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 8pt;
    font-weight: 700;
    color: #525252;
    line-height: 1.7;
  }
  .body {
    text-align: center;
    padding: 14mm 0 10mm 0;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.5em;
    font-size: 9pt;
    font-weight: 800;
    color: #ED8D31;
    margin-bottom: 6mm;
  }
  h1 {
    font-size: 32pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin-bottom: 12mm;
  }
  .recipient {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 9pt;
    font-weight: 800;
    color: #737373;
    margin-bottom: 4mm;
  }
  .name {
    font-size: 38pt;
    font-weight: 200;
    letter-spacing: -0.025em;
    line-height: 1;
    color: #0A0A0A;
    margin-bottom: 3mm;
  }
  .matricule {
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 9pt;
    font-weight: 700;
    color: #737373;
    margin-bottom: 10mm;
  }
  .activity-line {
    font-size: 13pt;
    color: #525252;
    line-height: 1.7;
    max-width: 200mm;
    margin: 0 auto 6mm;
  }
  .activity-title {
    font-weight: 700;
    color: #0A0A0A;
  }
  .meta-row {
    display: flex;
    justify-content: center;
    gap: 12mm;
    margin-top: 8mm;
  }
  .meta-row > div {
    text-align: center;
  }
  .meta-label {
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 8pt;
    font-weight: 800;
    color: #737373;
    margin-bottom: 2mm;
  }
  .meta-value {
    font-size: 12pt;
    font-weight: 700;
    color: #0A0A0A;
  }
  .meta-value.accent { color: #ED8D31; }
  .footer {
    position: absolute;
    bottom: 18mm;
    left: 34mm;
    right: 34mm;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .signature {
    text-align: center;
    width: 60mm;
  }
  .sig-line {
    border-top: 1px solid #0A0A0A;
    padding-top: 2mm;
  }
  .sig-name {
    font-weight: 700;
    font-size: 10pt;
  }
  .sig-role {
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-size: 8pt;
    font-weight: 700;
    color: #737373;
    margin-top: 1mm;
  }
  .seal {
    text-align: center;
  }
  .seal-circle {
    width: 28mm; height: 28mm;
    border: 1.5px solid #ED8D31;
    border-radius: 50%;
    display: inline-block;
    line-height: 28mm;
    color: #ED8D31;
    font-weight: 900;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }
  .colophon {
    position: absolute;
    bottom: 9mm;
    left: 34mm;
    right: 34mm;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.32em;
    font-size: 7pt;
    font-weight: 700;
    color: #A3A3A3;
  }
</style>
</head>
<body>

<div class="ribbon"></div>

<div class="frame">
  <div class="header">
    <div class="brand">
      <span class="logo">S</span>
      <span class="brand-name">SONATRACH</span>
    </div>
    <div class="ref">
      Référence : {{ $reference }}<br/>
      Direction Centrale Capital Humain<br/>
      Édition {{ now()->format('Y') }}
    </div>
  </div>

  <div class="body">
    <p class="eyebrow">Certificat de participation</p>

    <h1>Certificat de participation</h1>

    <p class="recipient">Décerné à</p>
    <p class="name">{{ $userFirstName }} {{ $userLastName }}</p>
    <p class="matricule">Matricule {{ $employeeNumber }}</p>

    <p class="activity-line">
      Pour sa participation effective à l'activité socio-culturelle
      <span class="activity-title">«&nbsp;{{ $activityTitle }}&nbsp;»</span>
      organisée par le comité socio-activités Sonatrach.
    </p>

    <div class="meta-row">
      <div>
        <p class="meta-label">Période</p>
        <p class="meta-value">{{ $startDate }} → {{ $endDate }}</p>
      </div>
      <div>
        <p class="meta-label">Site</p>
        <p class="meta-value">{{ $siteName ?: '—' }}</p>
      </div>
      <div>
        <p class="meta-label">Catégorie</p>
        <p class="meta-value accent">{{ $category }}</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="signature">
      <div class="sig-line">
        <p class="sig-name">Direction Capital Humain</p>
        <p class="sig-role">Signataire autorisé</p>
      </div>
    </div>
    <div class="seal">
      <span class="seal-circle">Sonatrach<br/>Officiel</span>
    </div>
    <div class="signature">
      <div class="sig-line">
        <p class="sig-name">Comité socio-activités</p>
        <p class="sig-role">Sonatrach SpA</p>
      </div>
    </div>
  </div>

  <p class="colophon">
    Document officiel · Sonatrach SpA · Djenane El Malik, Hydra · Alger · Algérie
  </p>
</div>

<div class="ribbon-end"></div>

</body>
</html>
