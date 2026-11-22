# BoilerChem9 — Química de Calderas en Campo

Aplicación web progresiva (**PWA**) diseñada para móviles **Android (Oppo, Samsung, Xiaomi, etc.)**, pensada para operar directamente junto a la caldera, incluso **sin conexión a internet**.

## Funcionalidades principales

1. **Los 9 Parámetros Críticos (`Análisis`)**
   - Captura rápida con teclado numérico en celular:
     1. pH del agua de caldera
     2. Alcalinidad P (Fenolftaleína)
     3. Alcalinidad Total (M) — calcula automáticamente Alcalinidad $\text{OH}^- \approx 2P - M$
     4. Dureza Total
     5. TDS / Sólidos Disueltos
     6. Sulfito Residual ($\text{SO}_3^{2-}$)
     7. Fosfatos Residuales ($\text{PO}_4^{3-}$)
     8. Sílice ($\text{SiO}_2$)
     9. Cloruros ($\text{Cl}^-$)
   - Semáforo en tiempo real (**Óptimo / Precaución / Crítico**) según rangos ASME/ABMA por presión.
   - Diagnóstico automático con acciones correctivas y envío directo por **WhatsApp**.

2. **Calculadoras de Campo (`Cálculos`)**
   - **Ciclos de Concentración (CoC) y % de Purga** (kg/h de purga y agua de reposición).
   - **Dosificación de Químicos** (Sulfito de Sodio, Fosfatos, Sosa Cáustica).
   - **Índices Langelier (LSI) y Ryznar (RSI)** para agua de reposición/suavizador.
   - **Conversor de Unidades** ($\mu\text{S/cm} \leftrightarrow \text{ppm}$, $\text{psi} \leftrightarrow \text{bar}$, $^{\circ}\text{C} \leftrightarrow {}^{\circ}\text{F}$, $\text{gpg} \leftrightarrow \text{ppm}$, $\text{m}^3/\text{h} \leftrightarrow \text{GPM}$).

3. **Historial y Tendencias (`Historial`)**
   - Almacenamiento local (`localStorage`) sin necesidad de servidor ni internet.
   - Gráfica de tendencia por parámetro con banda de rango óptimo.
   - Exportación a **CSV** y resumen por **WhatsApp**.

4. **Guía Técnica (`Guía`)**
   - Tabla de límites ASME/ABMA para Baja, Media y Alta Presión.
   - Diagnóstico rápido de fallas: corrosión por oxígeno, incrustación, arrastre/espuma (*carryover*) y condensado ácido.

5. **Gestión de Equipos e Instalación (`Equipos`)**
   - Múltiples calderas configurables.
   - Botón e instrucciones para instalar en **Android / Oppo** como app nativa.

## Cómo instalarla en un celular Oppo (Android)

1. Publica el proyecto en **GitHub Pages** (el workflow `.github/workflows/deploy.yml` lo hace automáticamente al hacer `push` a `main` si habilitas *Settings → Pages → Source: GitHub Actions*).
2. Abre el enlace en **Google Chrome** desde el celular Oppo.
3. Toca el menú **⋮** → **Instalar aplicación** (o **Agregar a la pantalla principal**).

## Desarrollo local

```bash
npm install
npm run dev
npm run build
```
