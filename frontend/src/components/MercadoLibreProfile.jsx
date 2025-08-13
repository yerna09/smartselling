import React from 'react';

const Section = ({ title, children }) => (
  <section style={{ marginBottom: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: '1.5rem' }}>
    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{title}</h3>
    {children}
  </section>
);

const MercadoLibreProfile = ({ data }) => {
  if (!data) return null;
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <Section title="Usuario">
        <p><strong>Nombre:</strong> {data.first_name} {data.last_name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Nickname:</strong> {data.nickname}</p>
        <p><strong>CUIT:</strong> {data.identification?.number}</p>
        <p><strong>Perfil ML:</strong> <a href={data.permalink} target="_blank" rel="noopener noreferrer">{data.permalink}</a></p>
        <p><strong>Fecha de registro:</strong> {data.registration_date}</p>
      </Section>
      <Section title="Empresa">
        <p><strong>Nombre:</strong> {data.company?.corporate_name}</p>
        <p><strong>Identificación:</strong> {data.company?.identification}</p>
        <p><strong>CUIT:</strong> {data.company?.identification}</p>
        <p><strong>Tipo:</strong> {data.company?.cust_type_id}</p>
      </Section>
      <Section title="Dirección">
        <p><strong>Dirección:</strong> {data.address?.address}</p>
        <p><strong>Ciudad:</strong> {data.address?.city}</p>
        <p><strong>Provincia:</strong> {data.address?.state}</p>
        <p><strong>Código Postal:</strong> {data.address?.zip_code}</p>
      </Section>
      <Section title="Teléfono">
        <p><strong>Número:</strong> {data.phone?.number}</p>
        <p><strong>Verificado:</strong> {data.phone?.verified ? 'Sí' : 'No'}</p>
      </Section>
      <Section title="Reputación como Vendedor">
        <p><strong>Experiencia:</strong> {data.seller_experience}</p>
        <p><strong>Ventas completadas:</strong> {data.seller_reputation?.metrics?.sales?.completed}</p>
        <p><strong>Transacciones completadas:</strong> {data.seller_reputation?.transactions?.completed}</p>
        <p><strong>Transacciones canceladas:</strong> {data.seller_reputation?.transactions?.canceled}</p>
        <p><strong>Calificaciones:</strong> Positivas: {data.seller_reputation?.transactions?.ratings?.positive}, Negativas: {data.seller_reputation?.transactions?.ratings?.negative}, Neutrales: {data.seller_reputation?.transactions?.ratings?.neutral}</p>
      </Section>
      <Section title="Reputación como Comprador">
        <p><strong>Transacciones canceladas:</strong> {data.buyer_reputation?.canceled_transactions}</p>
        <p><strong>Tags:</strong> {data.buyer_reputation?.tags?.join(', ')}</p>
      </Section>
      <Section title="Otros Datos">
        <p><strong>País:</strong> {data.country_id}</p>
        <p><strong>Estado de cuenta:</strong> {data.status?.site_status}</p>
        <p><strong>Tipo de usuario:</strong> {data.user_type}</p>
        <p><strong>Tags:</strong> {data.tags?.join(', ')}</p>
      </Section>
    </div>
  );
};

export default MercadoLibreProfile;