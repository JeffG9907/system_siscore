import React, { useState } from "react";
import { createIncidencia } from "../services/api";

const IncidenciaForm = () => {
  const [form, setForm] = useState({ descripcion: "", fecha: "" });
  const [foto, setFoto] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFoto = e => setFoto(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("descripcion", form.descripcion);
    formData.append("fecha", form.fecha);
    if (foto) formData.append("foto", foto);
    await createIncidencia(formData);
    alert("Incidencia registrada");
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <label>Descripción: <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required /></label>
      <label>Fecha: <input name="fecha" type="date" value={form.fecha} onChange={handleChange} required /></label>
      <label>Foto: <input type="file" onChange={handleFoto} accept="image/*" /></label>
      <button type="submit">Registrar Incidencia</button>
    </form>
  );
};

export default IncidenciaForm;