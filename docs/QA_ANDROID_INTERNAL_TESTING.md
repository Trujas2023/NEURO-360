# Pruebas manuales en Android — Prueba interna (V2 Fases 0–6)

Build a probar: `version 0.1.0`, `versionCode 5`, paquete
`com.senseplayadventures.app`.

Marca cada punto como ✅ / ❌ y anota el modelo de teléfono y la versión
de Android. Los puntos marcados **⚠️ NO EXISTE** no se pueden probar: la
función no está implementada todavía y se indica a propósito para que no
se reporte como falla.

---

## 1. Inicio de aplicación

- [ ] La app abre sin pantalla en blanco ni cierre inmediato.
- [ ] Aparece la pantalla de Bienvenida con el nombre y el botón "Comenzar".
- [ ] "Comenzar" lleva al selector de perfil.
- [ ] El texto del selector dice **"¿Quién va a usar la app?"** (ya no
      "¿Quién va a jugar?").
- [ ] Si no hay perfiles, se ve el mensaje indicando que un adulto cree
      el primero desde Modo Adulto.

## 2. Perfil

- [ ] Entrar a Modo Adulto pide PIN.
- [ ] La primera vez permite **crear** el PIN; las siguientes lo **valida**.
- [ ] Un PIN incorrecto no deja entrar.
- [ ] Crear un perfil con nombre y color de avatar.
- [ ] Crear un perfil con **foto** (cámara y galería).
- [ ] Editar un perfil existente (nombre, foto, color).
- [ ] Eliminar un perfil pide confirmación.
- [ ] Al eliminar un perfil **desaparecen también sus datos** (tarjetas,
      rutinas, ajustes) y **no se tocan los de los otros perfiles**.
- [ ] Cambiar de perfil desde Inicio actualiza el saludo "Hola, <nombre>".

## 3. Mi Voz AAC

- [ ] El tab "Mi Voz" abre el comunicador.
- [ ] Se ve la fila de **vocabulario núcleo** arriba.
- [ ] Se ven las categorías y los accesos rápidos.
- [ ] Entrar a una categoría muestra sus tarjetas y "Volver" regresa.
- [ ] El **buscador** encuentra tarjetas y palabras núcleo escribiendo texto.
- [ ] Probar los 4 **niveles de comunicación** desde Modo Adulto →
      Ajustes de Mi Voz, y verificar que la pantalla cambia:
  - [ ] Nivel 1: pocas opciones grandes, **sin barra de frase**.
  - [ ] Nivel 2: una grilla de tarjetas núcleo, sin categorías.
  - [ ] Nivel 3: núcleo + categorías, sin buscador.
  - [ ] Nivel 4: comunicador completo.
- [ ] Cambiar **tamaño de tablero** y **tamaño de texto** y ver el efecto.
- [ ] Apagar "Mostrar categorías" / "Favoritos" / "Más usados" y verificar
      que desaparecen.

## 4. Barra de frases

- [ ] Tocar tarjetas las agrega a la barra en orden.
- [ ] Tocar una palabra de la barra la quita individualmente.
- [ ] "Borrar" quita la última palabra.
- [ ] "Limpiar" vacía la frase.
- [ ] "Guardar" guarda la frase y avisa.
- [ ] La frase guardada aparece en **"Frases guardadas"** y se reproduce
      al tocarla.
- [ ] La ✕ de una frase guardada la elimina (con confirmación).
- [ ] Con **"Hablar al tocar" ON**: cada tarjeta suena al instante.
- [ ] Con **"Hablar al tocar" OFF**: la tarjeta NO suena al tocarla, solo
      se agrega; suena al pulsar "Hablar".

## 5. Reproducción TTS

- [ ] "Hablar" lee la frase completa en español.
- [ ] Tocar varias tarjetas rápido **no superpone audio** (la última gana).
- [ ] Cambiar **velocidad** (Lenta/Normal/Rápida) en Ajustes de Mi Voz y
      notar la diferencia con "Probar voz".
- [ ] Cambiar **tono** (Grave/Normal/Agudo) y notar la diferencia.
- [ ] Con "Sonido activado" apagado en el perfil, **no se reproduce nada**.
- [ ] Si el dispositivo no tiene voz en español instalada, comprobar qué
      pasa (puede quedar mudo: anotarlo, es dependiente del sistema).

## 6. Categorías

- [ ] Se ven las 20 categorías reales + Favoritos / Más usados / Recientes.
- [ ] Cada categoría abre su tablero y muestra solo sus tarjetas.
- [ ] Una categoría sin tarjetas muestra el mensaje de vacío correcto.
- [ ] "Volver" desde una categoría regresa al comunicador.

## 7. Favoritos

- [ ] Marcar una tarjeta como favorita desde Modo Adulto.
- [ ] La tarjeta aparece en **Favoritos** con su estrella.
- [ ] Desmarcarla la quita de Favoritos.
- [ ] **Más usados**: tocar varias veces una tarjeta y verificar que
      aparece y sube de posición.
- [ ] **Recientes**: la última tarjeta usada aparece primero.

## 8. Tarjetas personalizadas

- [ ] Crear una tarjeta nueva (texto, categoría, emoji, color).
- [ ] Usar el campo **"Qué dirá en voz alta"** distinto del texto visible
      y comprobar que dice el texto hablado, no el visible.
- [ ] **"Probar voz"** reproduce antes de guardar.
- [ ] Editar una tarjeta existente.
- [ ] Eliminar una tarjeta pide confirmación.
- [ ] Con "Confirmar antes de borrar" **apagado**, elimina sin preguntar.
- [ ] Reordenar tarjetas con ↑ / ↓ dentro de una categoría.

## 9. Cámara / galería

- [ ] Tomar foto para una tarjeta AAC (pide permiso de cámara la 1ª vez).
- [ ] Elegir foto de galería para una tarjeta (pide permiso la 1ª vez).
- [ ] **Denegar** el permiso muestra un aviso claro y no cierra la app.
- [ ] La foto reemplaza al emoji en la tarjeta.
- [ ] "Quitar foto" vuelve al emoji.
- [ ] Foto de perfil: cámara y galería.
- [ ] Foto de un **paso de rutina** en Mi Día (Centro Adulto).
- [ ] Las fotos **siguen ahí** después de cerrar y reabrir la app.

## 10. Grabación de voz

La grabación de voz personalizada por un adulto **está implementada**
(dependencia `expo-audio` + `expo-file-system`). Solo se accede desde el
editor de tarjetas en Modo Adulto (protegido por PIN), igual que el resto
del formulario.

**Permisos**

- [ ] Al abrir la app y navegar por "Mi Voz" **no** aparece ningún aviso de
      permiso de micrófono (el permiso nunca se pide al inicio).
- [ ] Al tocar **"Grabar voz"** por primera vez aparece primero una
      explicación en pantalla ("Usar el micrófono...") con **Cancelar** /
      **Continuar**, antes de que el sistema pida el permiso.
- [ ] Tocar **Cancelar** en esa explicación no pide permiso al sistema y no
      inicia ninguna grabación.
- [ ] Tocar **Continuar** dispara el diálogo de permiso nativo de Android.
- [ ] **Conceder** el permiso inicia la grabación de inmediato.
- [ ] **Denegar** el permiso muestra un aviso claro en la tarjeta ("No
      diste permiso... puede seguir usando voz sintética") y la app sigue
      funcionando con TTS; no se cierra ni queda bloqueada.
- [ ] Denegar el permiso **dos veces** (Android deja de volver a preguntar):
      al tocar "Grabar voz" de nuevo aparece un aviso para activarlo desde
      los ajustes del sistema, sin volver a mostrar el diálogo nativo.

**Grabación**

- [ ] Al grabar se ve un indicador visual claro (punto rojo + "Grabando…"
      con el tiempo transcurrido).
- [ ] **Detener** guarda la grabación y muestra un indicador de "Guardando…"
      breve mientras se persiste el archivo.
- [ ] Después de guardar aparecen los botones **Escuchar**, **Volver a
      grabar** y **Eliminar grabación**.
- [ ] **Escuchar** reproduce la grabación recién hecha.
- [ ] **Volver a grabar** permite grabar de nuevo y reemplaza la anterior
      al guardar la tarjeta.
- [ ] **Eliminar grabación** quita la grabación del formulario (la tarjeta
      queda sin audio propio, usará TTS) sin necesidad de guardar todavía.
- [ ] **Cancelar** el formulario después de grabar, volver a grabar, o
      eliminar una grabación **no debe** dejar la tarjeta original rota:
      vuelve a abrir la tarjeta y comprueba que conserva su grabación (o su
      ausencia) previa a esos cambios sin guardar.
- [ ] **Guardar** la tarjeta con una grabación nueva la deja disponible al
      tocarla desde "Mi Voz".

**Reproducción (grabación vs. TTS)**

- [ ] Una tarjeta **con** grabación reproduce la voz grabada al tocarla,
      no el TTS del sistema.
- [ ] Una tarjeta **sin** grabación sigue usando TTS exactamente igual que
      antes.
- [ ] Nunca se escuchan la grabación y el TTS **al mismo tiempo** para la
      misma tarjeta.
- [ ] Al construir una **frase de varias tarjetas** (algunas con
      grabación, otras sin) y tocar "Hablar", la frase completa se lee con
      TTS (voz consistente); no intenta encadenar grabaciones distintas.
- [ ] Las **frases guardadas** ("Guardar frase") también se reproducen con
      TTS al tocarlas.

**Persistencia**

- [ ] Grabar una tarjeta, **cerrar la app por completo** y volver a
      abrirla: la grabación sigue disponible y se reproduce igual.
- [ ] Grabar una tarjeta, **reiniciar el dispositivo** y volver a abrir la
      app: la grabación sigue disponible.
- [ ] La grabación **no** debe perderse con una actualización normal de la
      app desde Google Play (verificar si hay oportunidad de instalar una
      build más nueva sobre una anterior con tarjetas grabadas).
- [ ] **Eliminar una tarjeta** con grabación la borra correctamente (no
      queda un archivo de audio huérfano ni un error al eliminar).
- [ ] **Eliminar un perfil completo** que tenía tarjetas con grabaciones no
      produce errores ni deja la app en un estado inconsistente.

**Privacidad**

- [ ] En ningún punto del flujo de grabación se menciona ni ocurre una
      subida a internet, nube o servidor: la explicación en pantalla dice
      explícitamente que la grabación se guarda solo en el dispositivo.
- [ ] La app funciona igual con el **WiFi/datos apagados** (grabar,
      escuchar y reproducir tarjetas grabadas no requieren red).

**Modo Adulto / Modo Niño**

- [ ] Grabar, volver a grabar o eliminar una grabación **solo** es posible
      dentro del editor de tarjetas de Modo Adulto (tras el PIN); no hay
      forma de llegar a esas acciones desde Modo Niño.
- [ ] Desde **Modo Niño**, el niño puede tocar una tarjeta con grabación y
      escucharla con normalidad, pero no tiene acceso a grabar, reemplazar
      ni eliminar esa grabación.

**Manejo de errores**

- [ ] Denegar el permiso de micrófono: aviso claro, la app sigue
      funcionando (cubierto arriba).
- [ ] Micrófono no disponible (p. ej. en uso por otra app, si se puede
      simular): la app muestra un aviso ("No se pudo iniciar la
      grabación...") y no se cierra.
- [ ] Interrumpir la grabación a la fuerza (p. ej. mandar la app a segundo
      plano o recibir una llamada mientras graba, si es posible probarlo):
      la app no se cierra ni queda en un estado bloqueado al volver.
- [ ] Si el archivo de audio de una tarjeta ya no existe en el dispositivo
      (por ejemplo, borrado manualmente fuera de la app), tocar la tarjeta
      cae de vuelta a TTS en lugar de fallar en silencio.
- [ ] Un error de reproducción (archivo dañado, etc.) muestra un aviso en
      el editor y no cierra la app.

## 11. Mi Día

- [ ] El tab "Mi Día" muestra las rutinas con su progreso.
- [ ] Un perfil **nuevo** recibe las 10 rutinas predeterminadas.
- [ ] Un perfil **existente** conserva las rutinas que ya tenía (no se
      sobrescriben ni aparecen duplicadas).
- [ ] Entrar a una rutina y marcar pasos con "Hecho".
- [ ] Tocar un paso lo **lee en voz alta**.
- [ ] "Reiniciar rutina" desmarca todos los pasos.
- [ ] Al marcar el **último** paso aparece el refuerzo "¡Muy bien!" y
      suena una sola vez (no en cada render).
- [ ] Probar los 3 **modos de presentación** (Centro Adulto → Mi Día →
      editar rutina → "Cómo se ve la rutina"):
  - [ ] Lista: todos los pasos, con PRIMERO/DESPUÉS.
  - [ ] Primero / Después: solo dos pasos a la vez.
  - [ ] Ahora / Después / Terminado: tres secciones.
- [ ] **Temporizador visual**: asignar duración a un paso (⏱ en Centro
      Adulto) y comprobar en el modo Primero/Después o Ahora que:
  - [ ] La barra se vacía al pulsar "Empezar".
  - [ ] "Pausa" la detiene y "Reiniciar" la reinicia.
  - [ ] Al llegar a cero **NO marca el paso solo** (es intencional).
- [ ] Con **"Reducir movimiento"** activo en el perfil, la barra se
      dibuja en bloques en vez de vaciarse de forma continua.
- [ ] Centro Adulto: crear, editar, **duplicar** y eliminar rutinas.
- [ ] Reordenar rutinas con ↑ / ↓.
- [ ] Agregar, reordenar y eliminar pasos.

## 12. Calma 360

- [ ] El tab "Calma" muestra las 15 frases.
- [ ] Tocar una frase la **reproduce de inmediato**.
- [ ] Tocar una frase **NO** abre ninguna pantalla nueva (importante).
- [ ] "Me duele" y "Tengo miedo" muestran el botón **"Contar más ›"**.
- [ ] Flujo **"Me duele"**:
  - [ ] Se puede elegir la parte tocando la **silueta corporal**.
  - [ ] Se puede elegir también desde la grilla de partes.
  - [ ] Elegir avanza solo al paso siguiente.
  - [ ] "Volver" retrocede **un paso**, no sale del flujo.
  - [ ] La frase final está bien escrita: p. ej. "Me duele mucho la
        cabeza. Arde." y con Dientes dice "Me **duelen** los dientes".
  - [ ] "Decirlo en voz alta" la reproduce; **no suena sola** al llegar.
  - [ ] "Necesito ayuda" reproduce esa frase.
  - [ ] "Empezar de nuevo" reinicia el flujo.
- [ ] Flujo **"Tengo miedo / saturado"**: qué te molesta → qué necesitas
      → frase final ("Me molesta el ruido. Necesito mis audífonos.").
- [ ] "Ir a Mundo Sensorial" abre el módulo real (ya no una pantalla
      "próximamente").
- [ ] **"Necesito un descanso"** (Fase 7G) abre de inmediato (sin
      preguntas previas, es un toque directo).
  - [ ] Elegir 1 / 2 / 5 minutos cambia la duración del temporizador
        visual (barra que se vacía).
  - [ ] Con el sonido del perfil **activado**, aparecen las opciones
        Silencio / Sonido suave / Brisa; elegir una la reproduce en bucle
        de inmediato (sin tener que "Empezar" el temporizador primero).
  - [ ] Cambiar de sonido mientras suena uno corta el anterior y arranca
        el nuevo (nunca los dos a la vez).
  - [ ] Con el sonido del perfil **desactivado**, no aparece ninguna
        opción de sonido.
  - [ ] "Empezar"/"Pausa"/"Reiniciar" del temporizador funcionan igual
        que en Mi Día.
  - [ ] "Volver" sale de la pantalla y corta el sonido si estaba sonando.
  - [ ] Funciona sin conexión (los sonidos están bundleados, no se
        descargan).

## 13. Mundo Sensorial

- [ ] Se entra desde Inicio ("Sensorial") y desde Calma.
- [ ] La entrada pregunta **"¿Qué necesitas ahora?"** con 7 opciones.
- [ ] **"Terminar" está visible y funciona en TODAS las actividades.**
- [ ] **Burbujas**: suben, se revientan al tocar, vibran suave al reventar.
- [ ] **Respiración**: el círculo crece y se achica; el texto cambia entre
      Inhala / Mantén / Exhala; "Pausar" y "Continuar" funcionan.
- [ ] Cambiar el patrón (3-3-4 / 4-4-4 / 4-2-6) cambia el ritmo.
- [ ] **Seguimiento visual**: el objeto cruza la pantalla; cambiar
      velocidad y color desde ajustes tiene efecto.
- [ ] **Pintura**: se dibuja con el dedo; probar los 4 modos (Trazo,
      Partículas, Brillo, Formas); cambiar color; "Limpiar" borra todo.
- [ ] **Causa y efecto**: cada toque genera una forma donde tocaste y vibra.
- [ ] **Sonidos y ritmo** (Fase 7F): 6 pastillas de color; cada una suena
      una nota distinta y pulsa al tocarla; tocar varias seguido no corta
      el sonido de la anterior (pueden sonar superpuestas); funciona sin
      conexión (los tonos están bundleados en la app, no se descargan).
- [ ] **Acuario** (Fase 7F): tocar en cualquier parte hace aparecer un pez
      que nada de un lado al otro y desaparece; sin límite de intentos;
      no tiene sonido (a propósito).
- [ ] Con "Vibración suave" apagada en ajustes, **no vibra** en ninguna.
- [ ] Con "Reducir movimiento" activo, burbujas, objeto, pastillas y peces
      van/pulsan más lento.

⚠️ **La actividad de SONIDOS AMBIENTALES no existe** (lluvia, mar, viento,
bosque, ruido blanco, agua) — **distinta de "Sonidos y ritmo"**, que sí
existe desde la Fase 7F. Los sonidos ambientales no aparecen en el menú a
propósito: requerirían grabaciones reales con licencia que el proyecto no
tiene, mientras que "Sonidos y ritmo" usa tonos propios sintetizados por
código (sin ninguna grabación de terceros involucrada). No reportes la
ausencia de sonidos ambientales como falla.

## 14. Juegos

- [ ] "Jugar" desde Inicio abre el selector con **6 juegos**.
- [ ] **Colores**: emparejar el color pedido.
- [ ] **Formas**: emparejar la figura (todas del mismo color, a propósito).
- [ ] **Emociones**: elegir la cara según la emoción pedida.
- [ ] **Clasificar**: elegir la categoría del objeto mostrado.
- [ ] **Memoria**: encontrar parejas; dos cartas distintas se vuelven a
      tapar **sin mensaje de error**.
- [ ] **Secuencias**: se enciende la secuencia y hay que repetirla;
      "Ver la secuencia otra vez" la repite.
- [ ] Al acertar: dice "¡Bien!" y **vibra**.
- [ ] Al equivocarse: dice "Intentemos otra vez", **NO vibra**, no resta y
      **no termina la partida**.
- [ ] Se muestra "Ronda X de Y" y **nunca** una cuenta regresiva.
- [ ] "Terminar" sale en cualquier momento.
- [ ] Al completar todas las rondas aparece "¡Terminaste!" con "Jugar
      otra vez".
- [ ] Cambiar **dificultad** (2/3/4 opciones) y **duración** (rondas)
      desde Centro Adulto → Juegos tiene efecto.
- [ ] Con "Voz de apoyo" apagada, no lee la consigna.

## 15. Persistencia después de cerrar la aplicación

Cerrar la app **por completo** (deslizar en multitarea), reabrir y verificar:

- [ ] Los perfiles siguen existiendo con su foto y color.
- [ ] El PIN sigue siendo el mismo.
- [ ] Las tarjetas creadas siguen ahí, con sus fotos.
- [ ] Favoritos, Más usados y Recientes se conservan.
- [ ] Las frases guardadas siguen ahí.
- [ ] Las rutinas y el estado de los pasos se conservan.
- [ ] Los ajustes (nivel AAC, voz, sensorial, juegos) se conservan.
- [ ] Reiniciar el **teléfono** y repetir la comprobación.

## 16. Funcionamiento sin Internet

Activar **modo avión** y verificar que todo sigue funcionando:

- [ ] Abrir la app.
- [ ] Mi Voz completo y TTS.
- [ ] Calma y sus dos flujos guiados.
- [ ] Mi Día.
- [ ] Mundo Sensorial (las 5 actividades).
- [ ] Los 6 juegos.
- [ ] Crear una tarjeta con foto.
- [ ] Ningún mensaje de error de red en ninguna pantalla.

## 17. Botón Atrás de Android

- [ ] Atrás desde una categoría vuelve al comunicador.
- [ ] Atrás desde un flujo de Calma sale del flujo.
- [ ] Atrás desde una actividad sensorial sale de la actividad.
- [ ] Atrás desde un juego sale del juego.
- [ ] Atrás desde los tabs principales **no cierra la app de golpe**
      dejando un perfil a medias — anotar el comportamiento observado.
- [ ] Atrás desde Modo Adulto no deja al niño dentro de configuración.
- [ ] Atrás durante una animación (burbujas, secuencia) no rompe nada.

## 18. Rotación / orientación

La app está fijada en **vertical** (`orientation: portrait`).

- [ ] Girar el teléfono: la app **se mantiene vertical**.
- [ ] Girar durante una actividad sensorial no la rompe.
- [ ] Con el teclado abierto (crear tarjeta) la pantalla sigue usable y
      los campos no quedan tapados.

## 19. Rendimiento

- [ ] Burbujas con intensidad **"Muchas"**: no se traba ni se calienta el
      teléfono de forma notoria.
- [ ] Pintura: dibujar un trazo largo y continuo sigue siendo fluido.
- [ ] Memoria en dificultad **Difícil** (8 cartas): responde bien.
- [ ] Scroll del comunicador con muchas tarjetas: fluido.
- [ ] Cambiar de tab repetidamente no degrada la app.
- [ ] Probar en el teléfono **más lento** disponible, no solo en uno bueno.

## 20. Errores o cierres inesperados

- [ ] La app **no se cierra sola** en ninguna de las pruebas anteriores.
- [ ] No aparece ninguna pantalla roja de error ni stack trace.
- [ ] Denegar permisos de cámara/galería no cierra la app.
- [ ] Dejar la app en segundo plano 10 minutos y volver: sigue funcionando.
- [ ] Recibir una llamada durante una actividad y volver: sigue funcionando.

Anotar para cada fallo: **qué pantalla**, **qué se hizo**, **qué pasó**,
**modelo y versión de Android**.
