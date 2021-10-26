import { GetServerSideProps } from 'next'
import Link from 'next/link'
import useSWR from "swr";

import { elapsedTime, formatIP } from '../lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const API = "/api/status/device";

function Device(props: { mac: string }) {
  const { data, error } = useSWR(`${API}?mac=${props.mac}`, fetcher);
  //console.log("Is data ready?", !!data);

  if (error) {
    console.log(error)
    return "An error has occurred.";
  }
  if (!data) return "Loading...";

  let title = data.nickname
  if (!title) {
    let short_mac = data.mac.substring(6, 12)
    if (data.type == "RELAY") {
      title = `Relay ${short_mac}`
    } else {
      title = `Basestation ${short_mac}`
    }
  }

  let deployment = <div />
  if (data.deployment) {
    deployment = <div>
      <b>Deployment:</b> <Link href={`/deployment?name=${data.deployment}`}>
        <a>{data.deployment}</a>
      </Link> <br/>
      <b>Relay ID:</b> {data.relay_id} <br/>
    </div>
  } else {
    deployment = <div>Not Deployed</div>
  }

  let readings = <div />
  if (data.data) {
    readings = <div>
      <h3>Data</h3>
      <b>LUX:</b> {parseFloat(data.data.lux).toFixed(3)} <br/>
      <b>TMP:</b> {parseFloat(data.data.tmp).toFixed(3)}°C <br/>
      <b>PRS:</b> {parseFloat(data.data.prs).toFixed(3)} Pa<br/>
      <b>HUM:</b> {parseFloat(data.data.hum).toFixed(3)}% <br/>
   </div>
  }

  let log = <div />
  if (data.log) {
    let list = []
    for (let l of data.log) {
      list.push(<div><b>[{l.timestamp}]:</b> {l.event} <br/></div>)
    }
    log = <div>
      <h3>Log</h3>
      {list}
    </div>
  }

  return (
    <div>
      <Link href="/"><a>home</a></Link>
      <h2>{title}</h2>
      <b>Mac:</b> {data.mac} <br/>
      <b>Type:</b> {data.type} <br/>
      <b>Last Seen:</b> {data.last_seen} ({elapsedTime(data.last_seen)}) <br/>
      <b>IP Address:</b> {formatIP(data.addr)} <br/>
      {deployment}

      {readings}
      {log}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (Array.isArray(context.query.mac)) {
    return { notFound: true }
  }
  return { props: { mac: context.query.mac } }
}

export default Device
