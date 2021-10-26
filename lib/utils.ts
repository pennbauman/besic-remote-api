export const LOCALHOST = ["localhost", "127.0.0.1", "::fff:127.0.0.1", "::1"]

export function elapsedTime(timestamp: Date) {
  let elapsed_sec = Math.floor((Date.now() - Date.parse(timestamp.toString()))/1000);
  if (elapsed_sec > 60) {
    let elapsed_min = Math.floor(elapsed_sec/60);
    if (elapsed_min > 60) {
      let elapsed_hour = Math.floor(elapsed_min/60);
      if (elapsed_hour > 24) {
        let elapsed_day = Math.floor(elapsed_hour/24);
        //return "<span style='color:red'>" + elapsed_day + "d ago</span>";
        return elapsed_day + "d ago";
      } else {
        //return "<span style='color:red'>" + elapsed_hour + "h ago</span>";
        return elapsed_hour + "h ago";
      }
    } else {
      //return "<span style='color:orange'>" + elapsed_min + "m ago</span>";
      return elapsed_min + "m ago";
    }
  } else {
    return elapsed_sec + "s ago";
  }
}

export function formatIP(ip: string) {
  if (LOCALHOST.includes(ip)) {
    return "localhost"
  }
  return ip
}
