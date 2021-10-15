import { GetServerSideProps } from 'next'
import Link from 'next/link'
import useSWR from "swr";

import { AppProps } from 'next/app'

import { ApiSummary, ApiResult} from '../lib/types'
import { getSummaryObj } from '../lib/db'

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const API = "/api/status/summary";

export default function Home() {
  const { data, error } = useSWR(API, fetcher);
  //console.log("Is data ready?", !!data);

  if (error) return "An error has occurred.";
  if (!data) return "Loading...";

  let devices = []
  for (let dev of data.devices) {
    devices.push(
      <li key={dev}>
        <Link href={`/device?mac=${dev}`}>
          <a>{dev}</a>
        </Link>
      </li>
    )
  }

  let deployments = []
  for (let dep of data.deployments) {
    deployments.push(
      <li key={dep}>
        <Link href={`/deployment?name=${dep}`}>
          <a>{dep}</a>
        </Link>
      </li>
    )
  }

  return (
    <div>
      <h3>Devices</h3>
      <ul>{devices}</ul>
      <h3>Deployments</h3>
      <ul>{deployments}</ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} }
}
