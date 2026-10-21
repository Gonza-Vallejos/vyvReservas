const nodemailer = require("nodemailer");
const appLogger = require("../utils/logger");

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'V&V Reservas 🚌';
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'vyvreservas25@gmail.com';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatDate = (value) => {
  if (!value) return 'No especificada';
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(`1970-01-01T${value}`);
  if (isNaN(date.getTime())) {
    // Intentar parsear como Date completo
    const full = new Date(value);
    if (!isNaN(full.getTime())) {
      return full.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }
    return String(value);
  }
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(num);
};

const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2c5282 100%);padding:32px 24px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:0.5px;">V&V Reservas</h1>
              <p style="color:#dbeafe;margin:8px 0 0;font-size:14px;">Pasajes de minibus de forma simple y segura</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;color:#1f2937;font-size:16px;line-height:1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:20px 24px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;">© ${new Date().getFullYear()} V&V Reservas. Todos los derechos reservados.</p>
              <p style="margin:0;">Este correo fue generado automáticamente. No respondas a esta dirección.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const passengerListHtml = (pasajeros) => {
  if (!pasajeros || pasajeros.length === 0) return '';
  const rows = pasajeros.map((p, i) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#374151;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#374151;">${p.apellido}, ${p.nombre}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#374151;">${p.dni}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#374151;text-align:center;">${p.numeroAsiento ?? '-'}</td>
    </tr>
  `).join('');
  return `
    <h3 style="color:#1e3a5f;margin-top:24px;">Pasajeros</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background-color:#eff6ff;">
          <th style="padding:10px 12px;text-align:left;color:#1e3a5f;border-bottom:2px solid #bfdbfe;">#</th>
          <th style="padding:10px 12px;text-align:left;color:#1e3a5f;border-bottom:2px solid #bfdbfe;">Nombre</th>
          <th style="padding:10px 12px;text-align:left;color:#1e3a5f;border-bottom:2px solid #bfdbfe;">DNI</th>
          <th style="padding:10px 12px;text-align:center;color:#1e3a5f;border-bottom:2px solid #bfdbfe;">Asiento</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const tripDetailsHtml = (reserva, viaje) => {
  const origen = viaje?.origenLocalidad || 'Origen';
  const destino = viaje?.destinoLocalidad || 'Destino';
  const fecha = formatDate(viaje?.fechaViaje);
  const hora = formatTime(viaje?.horarioSalida);
  return `
    <h3 style="color:#1e3a5f;margin-top:24px;">Detalles del viaje</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:8px;padding:16px;border-collapse:separate;">
      <tr>
        <td style="padding:8px 12px;color:#64748b;font-size:14px;width:35%;">Origen</td>
        <td style="padding:8px 12px;color:#1f2937;font-weight:600;">${origen}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#64748b;font-size:14px;">Destino</td>
        <td style="padding:8px 12px;color:#1f2937;font-weight:600;">${destino}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#64748b;font-size:14px;">Fecha</td>
        <td style="padding:8px 12px;color:#1f2937;font-weight:600;">${fecha}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#64748b;font-size:14px;">Horario de salida</td>
        <td style="padding:8px 12px;color:#1f2937;font-weight:600;">${hora}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;color:#64748b;font-size:14px;">Código de reserva</td>
        <td style="padding:8px 12px;color:#1e3a5f;font-weight:700;font-size:18px;">#${reserva.id}</td>
      </tr>
    </table>
  `;
};

const buildPlainText = (html) => {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

class EmailService {
  setTransporter(customTransporter) {
    this._transporter = customTransporter;
  }

  _getTransporter() {
    return this._transporter || transporter;
  }

  async send({ to, subject, html, bcc = null }) {
    if (!to) {
      appLogger.warn('email_skipped_no_recipient', { subject });
      return;
    }
    try {
      await this._getTransporter().sendMail({
        from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
        to,
        bcc,
        subject,
        html,
        text: buildPlainText(html),
      });
      appLogger.info('email_sent', { to, subject });
    } catch (error) {
      appLogger.error('email_send_failed', {
        to,
        subject,
        ...appLogger.errorDetails(error),
      });
    }
  }

  sendReservationConfirmation({ reserva, usuario, viaje, pasajeros }) {
    const nombre = usuario?.nombre || 'Pasajero';
    const total = (Number(viaje?.precio) || 0) * (pasajeros?.length || 1);
    const content = `
      <h2 style="color:#1e3a5f;margin-top:0;">¡Tu reserva fue creada!</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Recibimos tu reserva correctamente. A continuación te dejamos los detalles del viaje:</p>
      ${tripDetailsHtml(reserva, viaje)}
      ${passengerListHtml(pasajeros)}
      <p style="margin-top:24px;"><strong>Total a pagar:</strong> <span style="color:#1e3a5f;font-size:18px;font-weight:700;">${formatCurrency(total)}</span></p>
      <p>Recordá que tu lugar quedará confirmado una vez realizado el pago. Si ya pagaste, ignorá este mensaje.</p>
      <p style="margin-top:24px;">¡Gracias por elegir <strong>V&V Reservas</strong>!</p>
    `;
    this.send({
      to: usuario?.email,
      subject: `V&V Reservas - Reserva #${reserva.id} creada`,
      html: baseTemplate('Reserva creada', content),
    });
  }

  sendPaymentConfirmation({ reserva, usuario, viaje, pago, pasajeros }) {
    const nombre = usuario?.nombre || 'Pasajero';
    const monto = pago?.monto ?? (Number(viaje?.precio) || 0) * (pasajeros?.length || 1);
    const content = `
      <h2 style="color:#1e3a5f;margin-top:0;">¡Pago confirmado!</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu pago fue acreditado correctamente. Tu reserva ya está confirmada.</p>
      ${tripDetailsHtml(reserva, viaje)}
      ${passengerListHtml(pasajeros)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ecfdf5;border-radius:8px;padding:16px;border-collapse:separate;margin-top:24px;">
        <tr>
          <td style="padding:8px 12px;color:#047857;font-size:14px;width:35%;">Monto pagado</td>
          <td style="padding:8px 12px;color:#065f46;font-weight:700;font-size:18px;">${formatCurrency(monto)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#047857;font-size:14px;">Estado</td>
          <td style="padding:8px 12px;color:#065f46;font-weight:700;">Aprobado ✅</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#047857;font-size:14px;">Fecha de pago</td>
          <td style="padding:8px 12px;color:#065f46;font-weight:700;">${formatDate(pago?.fechaActualizacion || pago?.fechaCreacion || new Date())}</td>
        </tr>
      </table>
      <p style="margin-top:24px;">Guardá este correo como comprobante. ¡Buen viaje! 🚌</p>
    `;
    this.send({
      to: usuario?.email,
      subject: `V&V Reservas - Pago confirmado para la reserva #${reserva.id}`,
      html: baseTemplate('Pago confirmado', content),
    });
  }

  sendNewReservationNotificationToCompany({ reserva, usuario, viaje, pasajeros, empresa }) {
    const empresaEmail = empresa?.email;
    const ownerEmail = empresa?.email; // Se puede extender para incluir el email del chofer
    const to = ownerEmail || empresaEmail;
    if (!to) {
      appLogger.warn('company_email_notification_skipped', { reservaId: reserva.id, empresaId: empresa?.id });
      return;
    }
    const total = (Number(viaje?.precio) || 0) * (pasajeros?.length || 1);
    const content = `
      <h2 style="color:#1e3a5f;margin-top:0;">Nueva reserva recibida</h2>
      <p>Se ha realizado una nueva reserva para uno de tus viajes.</p>
      ${tripDetailsHtml(reserva, viaje)}
      ${passengerListHtml(pasajeros)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbeb;border-radius:8px;padding:16px;border-collapse:separate;margin-top:24px;">
        <tr>
          <td style="padding:8px 12px;color:#92400e;font-size:14px;width:35%;">Cliente</td>
          <td style="padding:8px 12px;color:#78350f;font-weight:600;">${usuario?.apellido || ''}, ${usuario?.nombre || ''}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#92400e;font-size:14px;">Email del cliente</td>
          <td style="padding:8px 12px;color:#78350f;font-weight:600;">${usuario?.email || '-'}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#92400e;font-size:14px;">Teléfono</td>
          <td style="padding:8px 12px;color:#78350f;font-weight:600;">${usuario?.telefono || '-'}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#92400e;font-size:14px;">Monto total</td>
          <td style="padding:8px 12px;color:#78350f;font-weight:700;font-size:18px;">${formatCurrency(total)}</td>
        </tr>
      </table>
      <p style="margin-top:24px;">Ingresá a la plataforma de <strong>V&V Reservas</strong> para gestionar la reserva.</p>
    `;
    this.send({
      to,
      subject: `V&V Reservas - Nueva reserva #${reserva.id} para tu viaje`,
      html: baseTemplate('Nueva reserva', content),
    });
  }

  sendCancellationConfirmation({ reserva, usuario, viaje, pasajeros }) {
    const nombre = usuario?.nombre || 'Pasajero';
    const total = (Number(viaje?.precio) || 0) * (pasajeros?.length || 1);
    const content = `
      <h2 style="color:#1e3a5f;margin-top:0;">Reserva cancelada</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu reserva fue cancelada correctamente. Los asientos fueron liberados.</p>
      ${tripDetailsHtml(reserva, viaje)}
      ${passengerListHtml(pasajeros)}
      <p style="margin-top:24px;"><strong>Total liberado:</strong> <span style="color:#b91c1c;font-size:18px;font-weight:700;">${formatCurrency(total)}</span></p>
      <p>Si el pago ya había sido acreditado, el reintegro se coordinará según las políticas de la empresa de transporte.</p>
      <p style="margin-top:24px;">Esperamos verte pronto en <strong>V&V Reservas</strong>.</p>
    `;
    this.send({
      to: usuario?.email,
      subject: `V&V Reservas - Reserva #${reserva.id} cancelada`,
      html: baseTemplate('Reserva cancelada', content),
    });
  }
}

module.exports = new EmailService();
