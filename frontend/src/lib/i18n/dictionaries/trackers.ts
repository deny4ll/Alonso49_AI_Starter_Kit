export const trackers = {
  es: {
    header: {
      title: 'Trackers GPS',
      subtitle: 'Sube el recorrido de tus sesiones (GPX/CSV) y visualízalo en el mapa',
    },
    linkSession: {
      label: 'Vincular a sesión (opcional)',
      none: 'Sin vincular',
    },
    upload: {
      button: 'Subir tracker',
      buttonLoading: 'Subiendo...',
    },
    hint: 'Si vinculás el tracker a una sesión, la velocidad media y máxima medidas por GPS se usan automáticamente en Estadísticas para comparar contra el objetivo del equipo.',
    errors: {
      uploadFailed: 'No se pudo subir el tracker. Verificá el formato del archivo (GPX o CSV).',
      tooFewPoints: 'No se pudieron leer al menos 2 puntos GPS del archivo.',
    },
    list: {
      loading: 'Cargando trackers...',
      empty: 'Todavía no subiste ningún tracker GPS.',
      defaultName: 'Tracker',
      maxSpeedSuffix: 'kn max',
    },
    map: {
      placeholder: 'Seleccioná un tracker para ver el recorrido en el mapa',
    },
  },
  en: {
    header: {
      title: 'GPS Trackers',
      subtitle: 'Upload the route of your sessions (GPX/CSV) and view it on the map',
    },
    linkSession: {
      label: 'Link to session (optional)',
      none: 'Not linked',
    },
    upload: {
      button: 'Upload tracker',
      buttonLoading: 'Uploading...',
    },
    hint: 'If you link the tracker to a session, the average and top speed measured by GPS are automatically used in Statistics to compare against the team target.',
    errors: {
      uploadFailed: 'Could not upload the tracker. Check the file format (GPX or CSV).',
      tooFewPoints: 'Could not read at least 2 GPS points from the file.',
    },
    list: {
      loading: 'Loading trackers...',
      empty: "You haven't uploaded any GPS trackers yet.",
      defaultName: 'Tracker',
      maxSpeedSuffix: 'kn max',
    },
    map: {
      placeholder: 'Select a tracker to see the route on the map',
    },
  },
}
