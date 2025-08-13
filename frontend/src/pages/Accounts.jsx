import React, { useEffect, useState } from 'react';
import MercadoLibreProfile from '../components/MercadoLibreProfile';

const Accounts = () => {
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/mercadolibre/data', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener datos de Mercado Libre');
        return res.json();
      })
      .then(data => {
        setMlData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando datos de Mercado Libre...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!mlData) return <div>No se encontraron datos de Mercado Libre.</div>;

  return (
    <div className="accounts-container">
      <h2>Datos de Mercado Libre</h2>
      <MercadoLibreProfile data={mlData} />
    </div>
  );
};

export default Accounts;
