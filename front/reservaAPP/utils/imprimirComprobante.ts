export const generarHTMLComprobante = (data: any) => {
   const formatDate = (fechaISO: string) => {
  const [year, month, day] = fechaISO.split('T')[0].split('-').map(Number);
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

  

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };
  return `
  <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f6f9;
        }

        .container {
          width: 800px;
          margin: auto;
          background-color: #fff;
          padding: 40px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 20px;
        }

        .empresa {
          font-size: 18px;
          color: #2c3e50;
        }

        .factura {
          text-align: right;
          font-size: 16px;
          color: #2c3e50;
        }

        .section-title {
          margin-top: 30px;
          font-size: 18px;
          color: #2c3e50;
          border-bottom: 1px solid #ccc;
          padding-bottom: 6px;
        }

        .info-table {
          width: 100%;
          margin-top: 10px;
          border-collapse: collapse;
        }

        .info-table td {
          padding: 6px 0;
          font-size: 14px;
          color: #555;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          table-layout: fixed; 
        }

        th {
          background-color: #2c3e50;
          color: white;
          padding: 8px;
          font-size: 14px;
          text-align: left;
        }

        td {
          border-bottom: 1px solid #ccc;
          padding: 8px;
          font-size: 14px;
          color: #333;
          text-align: left; 
        }

        .conceptos th:nth-child(1),
        .conceptos td:nth-child(1) {
          width: 35%;
        }

        .conceptos th:nth-child(2),
        .conceptos td:nth-child(2) {
          width: 20%;
        }

        .conceptos th:nth-child(3),
        .conceptos td:nth-child(3) {
          width: 20%;
        }

        .conceptos th:nth-child(4),
        .conceptos td:nth-child(4) {
          width: 25%;
          text-align: right; 
        }

        .totales {
          margin-top: 20px;
          text-align: right;
        }

        .totales p {
          font-size: 16px;
          margin: 4px 0;
        }

        .footer {
          margin-top: 30px;
          text-align: center;
          font-style: italic;
          color: #999;
          font-size: 13px;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="header">
          <div class="empresa">
          <strong>${data.empresa.nombre ?? 'Empresa'}</strong><br />
          Dirección: ${data.empresa.direccion ?? '-'}<br />
          Tel: ${data.empresa.telefono ?? '-'}<br />
          Email: ${data.empresa.email ?? '-'}
        </div>

          <div class="factura">
            <strong>Factura  Nº 0001-${data.ventas_id}</strong><br />
            Fecha: ${formatDate(data.fecha)}<br />
            Forma de Pago: ${data.formaPago ?? 'N/A'}
          </div>
        </div>

        <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
        <table class="info-table">
          <tr><td>Nombre:</td><td>${data.usuario.nombre} ${data.usuario.apellido}</td></tr>
          <tr><td>Email:</td><td>${data.usuario.email ?? '-'}</td></tr>
          <tr><td>Reserva N°:</td><td>${data.reserva_id}</td></tr>
        </table>

        <div class="section-title">DETALLES DEL VIAJE</div>
        <table class="info-table">
          <tr><td>Origen:</td><td>${data.origenLocalidad}</td></tr>
          <tr><td>Destino:</td><td>${data.destinoLocalidad}</td></tr>
          <tr><td>Fecha:</td><td>${formatDate(data.fechaViaje)}</td></tr>
          <tr><td>Hora de salida:</td><td>${formatTime(data.horarioSalida)}</td></tr>
        </table>

        <div class="section-title">CONCEPTOS</div>
       <table class="conceptos">
        <tr>
          <th>Pasajero/s</th>
          <th>Ubi. Origen</th>
          <th>Ubi. Destino</th>
          <th>Precio</th>
        </tr>
        ${data.pasajeros.map((p: any) => `
          <tr>
            <td>${p.nombre} ${p.apellido}</td>
            <td>${p.ubicacionOrigen}</td>
            <td>${p.ubicacionDestino}</td>
            <td>$${data.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
      </table>


        <div class="totales">
          <p>Subtotal: $${data.subTotal?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p>Descuento: ${data.descuento}%</p>
          <p><strong>Total: $${data.precioFinal?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
        </div>

        <div class="footer">
          Comprobante generado automáticamente. Gracias por su compra.
        </div>
      </div>
    </body>
  </html>
  `;
};