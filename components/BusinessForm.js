import { useState } from 'react';

const BusinessForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/add-business', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description, location }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage('Negocio agregado con éxito');
      setName('');
      setDescription('');
      setLocation('');
    } else {
      setMessage('Error al agregar el negocio');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre del negocio:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Descripción:</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <label>Ubicación:</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      <button type="submit">Agregar negocio</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default BusinessForm;
