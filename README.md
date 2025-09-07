## Cómo probar el flujo con Postman

1. Abre Postman (búscalo en el menú de aplicaciones o ejecuta `postman` en la terminal).
2. Haz clic en “New” > “HTTP Request”.
3. Selecciona el método `POST`.
4. En la barra de URL, pega la dirección que te da:
  ```
  minikube service hsb-service --url
  ```
  y agrega `/receive` al final. Ejemplo:
  ```
  http://192.168.49.2:30081/receive
  ```
5. Ve a la pestaña “Headers” y agrega:
  - Key: `Content-Type`
  - Value: `application/json`
6. Ve a la pestaña “Body”, selecciona “raw” y elige “JSON”.
7. Copia y pega el contenido de tu archivo `examples/bundle-message.json`.
8. Haz clic en “Send”.

Si todo está bien, deberías ver una respuesta como:
```
{"status":"OK","message":"Procesado y enviado a HAPI FHIR"}
```

---

### Errores comunes

- **404 Not Found**: Verifica que la URL termine en `/receive` y que el método sea `POST`. Asegúrate de que el servicio HSB esté corriendo y accesible.
- **Cannot GET /receive**: Es normal si accedes por navegador. Solo acepta POST.
- **400 Bad Request**: Revisa que el JSON esté bien formado y que las referencias (por ejemplo, `Patient/1`) existan en HAPI FHIR.

---
## Nota importante sobre el endpoint HSB `/receive`

Si abres la URL del HSB (`/receive`) en el navegador y ves el mensaje:

```
Cannot GET /receive
```

Esto es normal. El endpoint solo acepta solicitudes POST, no GET. Para probarlo correctamente, usa curl, Postman, Insomnia u otro cliente HTTP y envía un POST con el contenido adecuado (por ejemplo, `bundle-message.json`).

# Documentación: Flujo de Mensajería FHIR con HAPI FHIR + HSB + Minikube

## Requisitos previos
- Docker
- Minikube
- kubectl
- Node.js y npm

## 1. Clonar el repositorio y preparar el entorno
```bash
cd fhir-hsb-lab/hsb
npm install
```

## 2. Construir la imagen Docker de HSB
```bash
docker build -t hsb:1.0 .
```

## 3. Descargar la imagen de HAPI FHIR (si no existe)
```bash
docker pull hapiproject/hapi:latest
```

## 4. Desplegar en Minikube
```bash
kubectl apply -f ../hapi-fhir/hapi-fhir-deployment.yaml
kubectl apply -f hsb-deployment.yaml
```

## 5. Verificar los pods y servicios
```bash
kubectl get pods,svc
```

## 6. Crear el paciente en HAPI FHIR
```bash
curl -X POST $(minikube service hapi-fhir-service --url)/fhir/Patient \
  -H "Content-Type: application/fhir+json" \
  -d '{"resourceType":"Patient","name":[{"use":"official","family":"Test","given":["Paciente"]}],"gender":"male"}'
```

> Nota: Anota el ID asignado (por ejemplo, `1`).

## 7. Editar el archivo `examples/bundle-message.json`
Asegúrate de que la referencia del Encounter apunte al ID real del paciente:
```json
"subject": { "reference": "Patient/1" }
```

## 8. Enviar el Bundle al HSB
```bash
cd ../hsb
curl -X POST $(minikube service hsb-service --url)/receive \
  -H "Content-Type: application/json" \
  -d @../examples/bundle-message.json
```

## 9. Verificar que el Encounter fue almacenado
```bash
curl -X GET $(minikube service hapi-fhir-service --url)/fhir/Encounter
```

## 10. Acceso a las páginas web
- HAPI FHIR UI: Abre en tu navegador la URL que retorna:
  ```bash
  minikube service hapi-fhir-service --url
  ```
  Ejemplo: http://192.168.49.2:30080/

- HSB API (para pruebas):
  ```bash
  minikube service hsb-service --url
  ```
  Ejemplo: http://192.168.49.2:30081/receive

---

¡Listo! Así puedes desplegar, probar y visualizar el flujo de mensajería FHIR de extremo a extremo.
