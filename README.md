# Cronómetro de Costo por Hora

Cronómetro de Costo por Hora es una aplicación web simple diseñada para ayudar a freelancers y profesionales a registrar el tiempo trabajado en proyectos y calcular el costo asociado basado en una tarifa por hora configurable.

## Características Principales

*   **Registro de Usuarios:** Permite a los usuarios registrarse e iniciar sesión de forma individual.
*   **Cronómetro Funcional:** Funciones de inicio, pausa y detención para un control preciso del tiempo.
*   **Cálculo de Costo:** Calcula automáticamente el costo de la sesión actual basado en la tarifa por hora.
*   **Configuración de Tarifa:** Cada usuario puede configurar su propia tarifa por hora.
*   **Historial de Sesiones:** Guarda un historial de todas las sesiones cronometradas, incluyendo duración y costo.
*   **Persistencia de Datos:** Utiliza `localStorage` para guardar los datos de usuarios, sesiones y configuraciones, permitiendo que la información persista entre visitas.
*   **Interfaz Responsiva:** Diseñada para ser usable en diferentes tamaños de pantalla, utilizando TailwindCSS para los estilos base.

## Estructura del Proyecto

El proyecto está organizado en los siguientes archivos para una mejor mantenibilidad:

*   `index.html`: Contiene la estructura principal de la aplicación web (el esqueleto HTML).
*   `style.css`: Incluye todos los estilos personalizados para la apariencia visual de la aplicación.
*   `script.js`: Contiene toda la lógica de la aplicación, incluyendo la gestión de usuarios, el funcionamiento del cronómetro, el cálculo de costos y la interacción con `localStorage`.

## Mejoras de Seguridad

*   **Hashing de Contraseñas:** Las contraseñas de los usuarios ahora se almacenan de forma segura. Antes de guardarlas en `localStorage`, se les aplica un hash utilizando el algoritmo SHA-256 (a través de la API SubtleCrypto del navegador). Esto significa que las contraseñas en texto plano nunca se almacenan.

## Uso

1.  Abre el archivo `index.html` en tu navegador web.
2.  **Registro:** Si es tu primera vez, crea una cuenta utilizando el botón "Registrarse".
3.  **Inicio de Sesión:** Ingresa con tu nombre de usuario y contraseña.
4.  **Configuración (Opcional):** Ve a "Configuración" para establecer tu tarifa por hora. El valor por defecto es 100.
5.  **Cronómetro:**
    *   Usa "Inicio" para comenzar a cronometrar.
    *   "Pausa" para detener temporalmente el conteo.
    *   "Detener" para finalizar la sesión actual. La sesión se guardará en el historial.
6.  **Historial:** Consulta tus sesiones pasadas en "Ver Historial".
7.  **Cerrar Sesión:** Para salir de tu cuenta.

## Nota Importante sobre Actualización de Seguridad

Debido a la implementación del hashing de contraseñas, **las cuentas de usuario creadas ANTES de esta actualización de seguridad (donde las contraseñas se guardaban en texto plano) ya no funcionarán.** Los usuarios afectados necesitarán registrarse nuevamente para que sus contraseñas sean almacenadas de forma segura con el nuevo sistema de hash. Lamentamos cualquier inconveniente que esto pueda causar, pero es un paso crucial para mejorar la seguridad de los datos de los usuarios.
