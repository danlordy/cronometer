# Cronómetro de Costo por Hora

Cronómetro de Costo por Hora es una aplicación web simple diseñada para ayudar a freelancers y profesionales a registrar el tiempo trabajado en proyectos y calcular el costo asociado basado en una tarifa por hora configurable.

## Características Principales

*   **Registro de Usuarios:** Permite a los usuarios registrarse e iniciar sesión de forma individual.
*   **Cronómetro Funcional:** Funciones de inicio, pausa y detención para un control preciso del tiempo.
*   **Asociación de Tareas/Proyectos:** Permite asignar un nombre de tarea o proyecto a cada sesión cronometrada.
*   **Cálculo de Costo:** Calcula automáticamente el costo de la sesión actual basado en la tarifa por hora.
*   **Configuración Personalizada:**
    *   **Tarifa por Hora:** Cada usuario puede configurar su propia tarifa por hora.
    *   **Símbolo de Moneda:** Los usuarios pueden definir su propio símbolo de moneda (ej: $, €, £).
*   **Historial de Sesiones:** Guarda un historial de todas las sesiones cronometradas, incluyendo duración, costo y nombre de la tarea/proyecto.
*   **Exportación de Datos:** Permite exportar el historial de sesiones a un archivo CSV.
*   **Gestión de Datos del Usuario:** Opciones para limpiar el historial de sesiones del usuario actual o reiniciar completamente la aplicación.
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
4.  **Configuración (Opcional pero Recomendado):**
    *   Ve a "Configuración" para establecer tu tarifa por hora (el valor por defecto es 100).
    *   En la misma sección, puedes establecer tu **Símbolo de Moneda** preferido (ej: $, €, £; por defecto es $). Este símbolo se usará para mostrar los costos en el temporizador y en el historial.
5.  **Cronómetro:**
    *   Antes de iniciar el cronómetro, puedes ingresar un **Nombre de Tarea/Proyecto** en el campo provisto en la pantalla principal del temporizador. Este nombre es opcional pero ayuda a organizar tus sesiones.
    *   Usa "Inicio" para comenzar a cronometrar.
    *   "Pausa" para detener temporalmente el conteo.
    *   "Detener" para finalizar la sesión actual. La sesión, incluyendo el nombre de la tarea/proyecto, se guardará en el historial.
6.  **Historial:**
    *   Consulta tus sesiones pasadas en "Ver Historial". Cada entrada mostrará el nombre de la tarea/proyecto asociado.
7.  **Cerrar Sesión:** Para salir de tu cuenta.

## Gestión de Datos

En la sección de "Configuración", encontrarás opciones para gestionar tus datos:

*   **Exportar Historial a CSV:**
    *   Dentro de la sección "Historial de Sesiones", encontrarás un botón "Exportar Historial a CSV".
    *   Al hacer clic, se generará y descargará un archivo CSV con todo tu historial de sesiones, incluyendo fechas, horas, duraciones, nombre de tarea, costo y moneda.
*   **Limpiar Historial de Sesiones (Usuario Actual):**
    *   Este botón en "Configuración" te permite eliminar todas las entradas del historial de sesiones **solo para el usuario que ha iniciado sesión**.
    *   Se pedirá confirmación antes de proceder.
*   **Reiniciar Aplicación (Eliminar Todos los Datos):**
    *   Este botón en "Configuración" elimina **TODOS los datos de la aplicación**, incluyendo todos los usuarios, sus historiales y configuraciones.
    *   Debido a la naturaleza destructiva de esta acción, se mostrará una advertencia clara y se requerirá una confirmación explícita. Úsalo con precaución.

## Nota Importante sobre Actualización de Seguridad

Debido a la implementación del hashing de contraseñas, **las cuentas de usuario creadas ANTES de esta actualización de seguridad (donde las contraseñas se guardaban en texto plano) ya no funcionarán.** Los usuarios afectados necesitarán registrarse nuevamente para que sus contraseñas sean almacenadas de forma segura con el nuevo sistema de hash. Lamentamos cualquier inconveniente que esto pueda causar, pero es un paso crucial para mejorar la seguridad de los datos de los usuarios.
