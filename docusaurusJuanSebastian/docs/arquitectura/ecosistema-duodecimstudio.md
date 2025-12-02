---
id: ecosistema-duodecimstudio
title: Estrategia de Microservicios
---

# El Ecosistema DuodecimStudio

El ecosistema **DuodecimStudio** utiliza una arquitectura modular basada en microservicios distribuidos en **subdominios funcionales**.  
Cada subdominio representa un área, producto o servicio específico que puede crecer de forma independiente sin afectar al resto.

Esta estrategia permite integrar proyectos diversos —web apps, arte IA, publicidad, herramientas internas, automatizaciones, soporte técnico y landing pages— dentro de una misma identidad tecnológica.

---

# ✨ Enfoque General

Mi filosofía es dividir los proyectos en **dominios funcionales**, donde cada servicio cumple un rol claro:

- **Frontend Apps** → Angular, Next.js, React  
- **Backend Services** → Node.js, Firebase, PHP, Laravel  
- **Servicios Creativos** → IA (ComfyUI), arte digital, multimedia  
- **Automatizaciones** → N8N, scripts, tareas programadas  
- **Servicios Comerciales** → sistemas de ventas, landing pages, funnels  
- **Infraestructura** → Linux, Docker, Nginx, Proxmox, Cloud  

Cada pieza funciona como un microservicio, comunicándose mediante **APIs REST**, webhooks o integraciones N8N.

---

# 🗂️ Estructura Real por Subdominios

A continuación, la estructura real del ecosistema DuodecimStudio, con la función de cada subdominio:

---

## 🌐 **Sitio principal**
### `duodecimstudio.com.ar`  
- Portal central  
- Presentación institucional  
- Acceso a servicios, branding y redirecciones

---

## 🎯 **Marketing & Publicidad**
### `publicidad.duodecimstudio.com.ar`  
- Servicios de publicidad y promoción digital  
- Funnels de venta  
- Formularios de contacto + automatizaciones

### `landing.duodecimstudio.com.ar`  
- Landing pages para campañas específicas  
- Tests A/B  
- Integración con APIs y formularios automatizados

---

## 🎨 **Arte, IA & Galería**
### `gallery.duodecimstudio.com.ar`  
- Exposición de arte digital / IA  
- Portfolios visuales  
- Catálogo de coleccionables o assets

### `creaciondigital.duodecimstudio.com.ar`  
- Servicios de diseño digital  
- Arte AI (ComfyUI)  
- Edición de imagen y contenido visual

---

## 🤖 **Automatizaciones y Sistemas**
### `automatizacion-sistemas.duodecimstudio.com.ar`  
- Flujos N8N  
- Integraciones con redes sociales  
- Sincronización de datos  
- Automatizaciones comerciales y técnicas

---

## 🧩 **Servicios Técnicos & Organización**
### `digitalizar-organizar-gestionar.duodecimstudio.com.ar`  
- Organización de procesos  
- Digitalización, ERP, bases de datos  
- Software para gestión empresarial

### `soporte.duodecimstudio.com.ar`  
- Helpdesk  
- Tickets  
- Asistencia remota  
- SysAdmin y mantenimiento

---

## 🌍 **Sitios y Desarrollo Web**
### `sitios-web.duodecimstudio.com.ar`  
- Servicios de creación de páginas web  
- WordPress, WooCommerce  
- Desarrollo a medida (Angular/React/Node)  
- Hosting, SSL, dominios

---

## 🧪 **Formación & Aprendizaje**
### `estudiando-programacion.duodecimstudio.com.ar`  
- Cursos  
- Tutoriales  
- Documentación  
- Ejercicios  
- Material educativo personal

---

## 📧 **Infraestructura de Correos**
### `correos.duodecimstudio.com.ar`  
- Gestión de emails  
- Formularios conectados  
- Integración con APIs de envío  
- Automatización de notificaciones

---

## 🖥️ **Hardware / PC Gaming**
### `pc-gamer-hardware.duodecimstudio.com.ar`  
- Servicios relacionados con hardware  
- Asesoramiento  
- Presupuestos de PCs  
- Contenido sobre componentes

---

# 🧱 Cómo se conectan los subdominios

Todos los subdominios interactúan utilizando una capa técnica en común:

### ✔ APIs REST  
- Productos  
- Formularios  
- Carritos  
- Usuarios  
- Emails  
- Stocks  
- Assets  

### ✔ N8N como orquestador  
- Notificaciones  
- Emails automáticos  
- Integración con Google, LinkedIn, Meta, X  
- Backups  
- Workflows nocturnos  

### ✔ Servidores Linux  
- Nginx reverse proxy  
- Certificados SSL  
- Docker (microservicios individualizados)

### ✔ Base de datos  
- MySQL
- Firebase (auth + RTDB)
