// import { API } from "../preload"
const API = require("../preload")
declare global {
    interface Window {"api": typeof API}
}

