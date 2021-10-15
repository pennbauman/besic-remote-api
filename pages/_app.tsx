import '../styles/global.scss'
import { SWRConfig } from "swr";
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <SWRConfig>
    <Component {...pageProps} />
  </SWRConfig>
}
