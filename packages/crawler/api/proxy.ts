import { instance } from "./axios";

export function get_proxy() {
  return instance.get('proxy')
}