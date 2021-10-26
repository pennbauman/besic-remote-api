import { GetServerSideProps } from 'next'
import Link from 'next/link'
import useSWR from "swr";

import DataTable from '../components/DataTable'
const fetcher = (url: string) => fetch(url).then((res) => res.json());
const API = "/api/status/deployment";

function Device(props: { name: string }) {
  const { data, error } = useSWR(`${API}?name=${props.name}`, fetcher);
  //console.log("Is data ready?", !!data);

  if (error) return "An error has occurred.";
  if (!data) return "Loading...";

  let devices = []

  for (let dev of data.devices) {
    devices.push(
      <li key={dev.mac}>
        <Link href={`/device?mac=${dev.mac}`}>
          <a>{dev.mac}</a>
        </Link>
      </li>
    )
  }

  let lock = data.locked ? "true" : "false"

  return (
    <div>
      <Link href="/"><a>home</a></Link>
      <h2>{data.name}</h2>
      <b>Locked:</b> {lock} <br/>

      <h3>Devices</h3>
	  <DataTable {...data.devices}></DataTable>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (Array.isArray(context.query.name)) {
    return { notFound: true }
  }
  return { props: { name: context.query.name } }
}

export default Device
