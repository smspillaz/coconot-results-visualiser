import Head from 'next/head'
import { Container } from 'reactstrap'

const Layout = (props) => (
  <div>
    <Head>
      <title>Coconot</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" />
    </Head>
    <style jsx global>{`
      body {
        background: #f8f8f8
      }
    `}
    </style>
    <Container>
      {props.children}
    </Container>
  </div>
)

export default Layout
