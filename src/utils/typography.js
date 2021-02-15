import Typography from 'typography'
import GitHubTheme from 'typography-theme-github'

GitHubTheme.overrideThemeStyles = () => {
  return {
    a: {
      boxShadow: `none`,
      textDecoration: `none`,
      color: `#0687f0`,
    },
    'a.gatsby-resp-image-link': {
      boxShadow: `none`,
      textDecoration: `none`,
    },

    'a:hover': {
      textDecoration: `none`,
    },

    h1: {
      fontWeight: 800,
      lineHeight: 1.2,
      fontFamily: 'Catamaran',
    },

    h2: {
      fontWeight: 700,
      lineHeight: 1.2,
      marginTop: '56px',
      marginBottom: '20px',
      fontFamily: 'Catamaran',
    },

    ul: {
      marginBottom: '6px',
    },

    li: {
      marginBottom: '2px',
    },

    h3: {
      fontSize: '22px',
      fontWeight: 800,
      fontFamily: 'Catamaran',
    },

    h4: {
      fontSize: '18px',
      fontWeight: 800,
      fontFamily: 'Catamaran',
    },

    h5: {
      fontWeight: 800,
      fontFamily: 'Catamaran',
    },
  }
}

const typography = new Typography(GitHubTheme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
