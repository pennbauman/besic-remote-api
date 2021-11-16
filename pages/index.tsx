import { GetServerSideProps } from 'next'
import Link from 'next/link'
import useSWR from "swr";

import DeviceTable from '../components/DeviceTable'
import { ApiAll, ApiResult} from '../lib/types'
import { getSummaryObj } from '../lib/db'

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const API = "/api/status/all";

export default function Home() {
  const { data, error } = useSWR(API, fetcher);
  //console.log("Is data ready?", !!data);

  if (error) return "An error has occurred.";
  if (!data) return "Loading...";

  let deployments = []
  for (let dep of data.deployments) {
    deployments.push(<div>
      <Link href={`/deployment?name=${dep.name}`}>
        <a><h3>Deployment: '{dep.name}'</h3></a>
      </Link>
      <DeviceTable {...dep.devices}></DeviceTable>
    </div>)
  }

  return (
    <div>
      <h3>Undeployed</h3>
      <DeviceTable {...data.undeployed}></DeviceTable>

      {deployments}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} }
}
