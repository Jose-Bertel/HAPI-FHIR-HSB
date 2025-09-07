const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Recibir Bundle tipo message
app.post('/receive', async (req, res) => {
  console.log("📩 Mensaje recibido en HSB:", JSON.stringify(req.body, null, 2));

  try {
    const encounterEntry = req.body.entry.find(
      e => e.resource.resourceType === "Encounter"
    );

    if (encounterEntry) {
      const encounter = encounterEntry.resource;

      // Guardar Encounter en HAPI FHIR
      await axios.post("http://hapi-fhir-service:8080/fhir/Encounter", encounter, {
        headers: { "Content-Type": "application/fhir+json" }
      });
    }

    res.json({ status: "OK", message: "Procesado y enviado a HAPI FHIR" });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ status: "ERROR", error: error.message });
  }
});

app.listen(8081, () => console.log("🚀 HSB escuchando en puerto 8081"));
