"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
  format?: string
}

const countries: Country[] = [
  { code: "AD", name: "Andorra", flag: "🇦🇩", dialCode: "+376" },
  { code: "AE", name: "Emiratos Árabes Unidos", flag: "🇦🇪", dialCode: "+971" },
  { code: "AF", name: "Afganistán", flag: "🇦🇫", dialCode: "+93" },
  { code: "AG", name: "Antigua y Barbuda", flag: "🇦🇬", dialCode: "+1" },
  { code: "AI", name: "Anguila", flag: "🇦🇮", dialCode: "+1" },
  { code: "AL", name: "Albania", flag: "🇦🇱", dialCode: "+355" },
  { code: "AM", name: "Armenia", flag: "🇦🇲", dialCode: "+374" },
  { code: "AO", name: "Angola", flag: "🇦🇴", dialCode: "+244" },
  { code: "AQ", name: "Antártida", flag: "🇦🇶", dialCode: "+672" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54" },
  { code: "AS", name: "Samoa Americana", flag: "🇦🇸", dialCode: "+1" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dialCode: "+43" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "AW", name: "Aruba", flag: "🇦🇼", dialCode: "+297" },
  { code: "AX", name: "Islas Åland", flag: "🇦🇽", dialCode: "+358" },
  { code: "AZ", name: "Azerbaiyán", flag: "🇦🇿", dialCode: "+994" },
  { code: "BA", name: "Bosnia y Herzegovina", flag: "🇧🇦", dialCode: "+387" },
  { code: "BB", name: "Barbados", flag: "🇧🇧", dialCode: "+1" },
  { code: "BD", name: "Bangladés", flag: "🇧🇩", dialCode: "+880" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪", dialCode: "+32" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬", dialCode: "+359" },
  { code: "BH", name: "Baréin", flag: "🇧🇭", dialCode: "+973" },
  { code: "BI", name: "Burundi", flag: "🇧🇮", dialCode: "+257" },
  { code: "BJ", name: "Benín", flag: "🇧🇯", dialCode: "+229" },
  { code: "BL", name: "San Bartolomé", flag: "🇧🇱", dialCode: "+590" },
  { code: "BM", name: "Bermudas", flag: "🇧🇲", dialCode: "+1" },
  { code: "BN", name: "Brunéi", flag: "🇧🇳", dialCode: "+673" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591" },
  { code: "BQ", name: "Bonaire", flag: "🇧🇶", dialCode: "+599" },
  { code: "BR", name: "Brasil", flag: "🇧🇷", dialCode: "+55" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", dialCode: "+1" },
  { code: "BT", name: "Bután", flag: "🇧🇹", dialCode: "+975" },
  { code: "BV", name: "Isla Bouvet", flag: "🇧🇻", dialCode: "+47" },
  { code: "BW", name: "Botsuana", flag: "🇧🇼", dialCode: "+267" },
  { code: "BY", name: "Bielorrusia", flag: "🇧🇾", dialCode: "+375" },
  { code: "BZ", name: "Belice", flag: "🇧🇿", dialCode: "+501" },
  { code: "CA", name: "Canadá", flag: "🇨🇦", dialCode: "+1" },
  { code: "CC", name: "Islas Cocos", flag: "🇨🇨", dialCode: "+61" },
  { code: "CD", name: "República Democrática del Congo", flag: "🇨🇩", dialCode: "+243" },
  { code: "CF", name: "República Centroafricana", flag: "🇨🇫", dialCode: "+236" },
  { code: "CG", name: "Congo", flag: "🇨🇬", dialCode: "+242" },
  { code: "CH", name: "Suiza", flag: "🇨🇭", dialCode: "+41" },
  { code: "CI", name: "Costa de Marfil", flag: "🇨🇮", dialCode: "+225" },
  { code: "CK", name: "Islas Cook", flag: "🇨🇰", dialCode: "+682" },
  { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56" },
  { code: "CM", name: "Camerún", flag: "🇨🇲", dialCode: "+237" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", dialCode: "+506" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", dialCode: "+53" },
  { code: "CV", name: "Cabo Verde", flag: "🇨🇻", dialCode: "+238" },
  { code: "CW", name: "Curazao", flag: "🇨🇼", dialCode: "+599" },
  { code: "CX", name: "Isla de Navidad", flag: "🇨🇽", dialCode: "+61" },
  { code: "CY", name: "Chipre", flag: "🇨🇾", dialCode: "+357" },
  { code: "CZ", name: "República Checa", flag: "🇨🇿", dialCode: "+420" },
  { code: "DE", name: "Alemania", flag: "🇩🇪", dialCode: "+49" },
  { code: "DJ", name: "Yibuti", flag: "🇩🇯", dialCode: "+253" },
  { code: "DK", name: "Dinamarca", flag: "🇩🇰", dialCode: "+45" },
  { code: "DM", name: "Dominica", flag: "🇩🇲", dialCode: "+1" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴", dialCode: "+1" },
  { code: "DZ", name: "Argelia", flag: "🇩🇿", dialCode: "+213" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593" },
  { code: "EE", name: "Estonia", flag: "🇪🇪", dialCode: "+372" },
  { code: "EG", name: "Egipto", flag: "🇪🇬", dialCode: "+20" },
  { code: "EH", name: "Sahara Occidental", flag: "🇪🇭", dialCode: "+212" },
  { code: "ER", name: "Eritrea", flag: "🇪🇷", dialCode: "+291" },
  { code: "ES", name: "España", flag: "🇪🇸", dialCode: "+34" },
  { code: "ET", name: "Etiopía", flag: "🇪🇹", dialCode: "+251" },
  { code: "FI", name: "Finlandia", flag: "🇫🇮", dialCode: "+358" },
  { code: "FJ", name: "Fiyi", flag: "🇫🇯", dialCode: "+679" },
  { code: "FK", name: "Islas Malvinas", flag: "🇫🇰", dialCode: "+500" },
  { code: "FM", name: "Micronesia", flag: "🇫🇲", dialCode: "+691" },
  { code: "FO", name: "Islas Feroe", flag: "🇫🇴", dialCode: "+298" },
  { code: "FR", name: "Francia", flag: "🇫🇷", dialCode: "+33" },
  { code: "GA", name: "Gabón", flag: "🇬🇦", dialCode: "+241" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", dialCode: "+44" },
  { code: "GD", name: "Granada", flag: "🇬🇩", dialCode: "+1" },
  { code: "GE", name: "Georgia", flag: "🇬🇪", dialCode: "+995" },
  { code: "GF", name: "Guayana Francesa", flag: "🇬🇫", dialCode: "+594" },
  { code: "GG", name: "Guernsey", flag: "🇬🇬", dialCode: "+44" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
  { code: "GI", name: "Gibraltar", flag: "🇬🇮", dialCode: "+350" },
  { code: "GL", name: "Groenlandia", flag: "🇬🇱", dialCode: "+299" },
  { code: "GM", name: "Gambia", flag: "🇬�", dialCode: "+220" },
  { code: "GN", name: "Guinea", flag: "🇬🇳", dialCode: "+224" },
  { code: "GP", name: "Guadalupe", flag: "🇬🇵", dialCode: "+590" },
  { code: "GQ", name: "Guinea Ecuatorial", flag: "🇬🇶", dialCode: "+240" },
  { code: "GR", name: "Grecia", flag: "🇬🇷", dialCode: "+30" },
  { code: "GS", name: "Georgia del Sur", flag: "🇬🇸", dialCode: "+500" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", dialCode: "+502" },
  { code: "GU", name: "Guam", flag: "🇬🇺", dialCode: "+1" },
  { code: "GW", name: "Guinea-Bisáu", flag: "🇬🇼", dialCode: "+245" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", dialCode: "+592" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", dialCode: "+852" },
  { code: "HM", name: "Islas Heard y McDonald", flag: "🇭🇲", dialCode: "+672" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", dialCode: "+504" },
  { code: "HR", name: "Croacia", flag: "🇭🇷", dialCode: "+385" },
  { code: "HT", name: "Haití", flag: "🇭🇹", dialCode: "+509" },
  { code: "HU", name: "Hungría", flag: "🇭🇺", dialCode: "+36" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62" },
  { code: "IE", name: "Irlanda", flag: "🇮🇪", dialCode: "+353" },
  { code: "IL", name: "Israel", flag: "🇮🇱", dialCode: "+972" },
  { code: "IM", name: "Isla de Man", flag: "🇮🇲", dialCode: "+44" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "IO", name: "Territorio Británico del Océano Índico", flag: "🇮🇴", dialCode: "+246" },
  { code: "IQ", name: "Irak", flag: "🇮🇶", dialCode: "+964" },
  { code: "IR", name: "Irán", flag: "🇮🇷", dialCode: "+98" },
  { code: "IS", name: "Islandia", flag: "🇮🇸", dialCode: "+354" },
  { code: "IT", name: "Italia", flag: "🇮🇹", dialCode: "+39" },
  { code: "JE", name: "Jersey", flag: "🇯🇪", dialCode: "+44" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", dialCode: "+1" },
  { code: "JO", name: "Jordania", flag: "🇯🇴", dialCode: "+962" },
  { code: "JP", name: "Japón", flag: "🇯🇵", dialCode: "+81" },
  { code: "KE", name: "Kenia", flag: "🇰🇪", dialCode: "+254" },
  { code: "KG", name: "Kirguistán", flag: "🇰🇬", dialCode: "+996" },
  { code: "KH", name: "Camboya", flag: "🇰�", dialCode: "+855" },
  { code: "KI", name: "Kiribati", flag: "🇰🇮", dialCode: "+686" },
  { code: "KM", name: "Comoras", flag: "🇰🇲", dialCode: "+269" },
  { code: "KN", name: "San Cristóbal y Nieves", flag: "🇰🇳", dialCode: "+1" },
  { code: "KP", name: "Corea del Norte", flag: "🇰🇵", dialCode: "+850" },
  { code: "KR", name: "Corea del Sur", flag: "🇰🇷", dialCode: "+82" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dialCode: "+965" },
  { code: "KY", name: "Islas Caimán", flag: "🇰🇾", dialCode: "+1" },
  { code: "KZ", name: "Kazajistán", flag: "🇰🇿", dialCode: "+7" },
  { code: "LA", name: "Laos", flag: "🇱🇦", dialCode: "+856" },
  { code: "LB", name: "Líbano", flag: "🇱🇧", dialCode: "+961" },
  { code: "LC", name: "Santa Lucía", flag: "🇱🇨", dialCode: "+1" },
  { code: "LI", name: "Liechtenstein", flag: "🇱🇮", dialCode: "+423" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dialCode: "+94" },
  { code: "LR", name: "Liberia", flag: "🇱🇷", dialCode: "+231" },
  { code: "LS", name: "Lesoto", flag: "🇱🇸", dialCode: "+266" },
  { code: "LT", name: "Lituania", flag: "🇱🇹", dialCode: "+370" },
  { code: "LU", name: "Luxemburgo", flag: "🇱🇺", dialCode: "+352" },
  { code: "LV", name: "Letonia", flag: "🇱🇻", dialCode: "+371" },
  { code: "LY", name: "Libia", flag: "🇱🇾", dialCode: "+218" },
  { code: "MA", name: "Marruecos", flag: "🇲🇦", dialCode: "+212" },
  { code: "MC", name: "Mónaco", flag: "🇲🇨", dialCode: "+377" },
  { code: "MD", name: "Moldavia", flag: "🇲🇩", dialCode: "+373" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", dialCode: "+382" },
  { code: "MF", name: "San Martín", flag: "🇲🇫", dialCode: "+590" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", dialCode: "+261" },
  { code: "MH", name: "Islas Marshall", flag: "🇲🇭", dialCode: "+692" },
  { code: "MK", name: "Macedonia del Norte", flag: "🇲🇰", dialCode: "+389" },
  { code: "ML", name: "Malí", flag: "🇲🇱", dialCode: "+223" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", dialCode: "+95" },
  { code: "MN", name: "Mongolia", flag: "🇲🇳", dialCode: "+976" },
  { code: "MO", name: "Macao", flag: "🇲🇴", dialCode: "+853" },
  { code: "MP", name: "Islas Marianas del Norte", flag: "🇲🇵", dialCode: "+1" },
  { code: "MQ", name: "Martinica", flag: "🇲🇶", dialCode: "+596" },
  { code: "MR", name: "Mauritania", flag: "🇲🇷", dialCode: "+222" },
  { code: "MS", name: "Montserrat", flag: "🇲🇸", dialCode: "+1" },
  { code: "MT", name: "Malta", flag: "🇲🇹", dialCode: "+356" },
  { code: "MU", name: "Mauricio", flag: "🇲🇺", dialCode: "+230" },
  { code: "MV", name: "Maldivas", flag: "🇲🇻", dialCode: "+960" },
  { code: "MW", name: "Malaui", flag: "🇲🇼", dialCode: "+265" },
  { code: "MX", name: "México", flag: "🇲🇽", dialCode: "+52" },
  { code: "MY", name: "Malasia", flag: "🇲🇾", dialCode: "+60" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", dialCode: "+258" },
  { code: "NA", name: "Namibia", flag: "��🇦", dialCode: "+264" },
  { code: "NC", name: "Nueva Caledonia", flag: "🇳🇨", dialCode: "+687" },
  { code: "NE", name: "Níger", flag: "🇳�", dialCode: "+227" },
  { code: "NF", name: "Isla Norfolk", flag: "🇳🇫", dialCode: "+672" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", dialCode: "+505" },
  { code: "NL", name: "Países Bajos", flag: "🇳🇱", dialCode: "+31" },
  { code: "NO", name: "Noruega", flag: "🇳🇴", dialCode: "+47" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dialCode: "+977" },
  { code: "NR", name: "Nauru", flag: "🇳🇷", dialCode: "+674" },
  { code: "NU", name: "Niue", flag: "🇳🇺", dialCode: "+683" },
  { code: "NZ", name: "Nueva Zelanda", flag: "🇳🇿", dialCode: "+64" },
  { code: "OM", name: "Omán", flag: "🇴🇲", dialCode: "+968" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", dialCode: "+507" },
  { code: "PE", name: "Perú", flag: "🇵🇪", dialCode: "+51" },
  { code: "PF", name: "Polinesia Francesa", flag: "🇵🇫", dialCode: "+689" },
  { code: "PG", name: "Papúa Nueva Guinea", flag: "🇵🇬", dialCode: "+675" },
  { code: "PH", name: "Filipinas", flag: "🇵🇭", dialCode: "+63" },
  { code: "PK", name: "Pakistán", flag: "🇵🇰", dialCode: "+92" },
  { code: "PL", name: "Polonia", flag: "🇵🇱", dialCode: "+48" },
  { code: "PM", name: "San Pedro y Miquelón", flag: "🇵🇲", dialCode: "+508" },
  { code: "PN", name: "Islas Pitcairn", flag: "🇵🇳", dialCode: "+64" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", dialCode: "+1" },
  { code: "PS", name: "Palestina", flag: "🇵🇸", dialCode: "+970" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dialCode: "+351" },
  { code: "PW", name: "Palaos", flag: "🇵🇼", dialCode: "+680" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", dialCode: "+595" },
  { code: "QA", name: "Catar", flag: "🇶🇦", dialCode: "+974" },
  { code: "RE", name: "Reunión", flag: "🇷🇪", dialCode: "+262" },
  { code: "RO", name: "Rumania", flag: "🇷🇴", dialCode: "+40" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", dialCode: "+381" },
  { code: "RU", name: "Rusia", flag: "🇷🇺", dialCode: "+7" },
  { code: "RW", name: "Ruanda", flag: "🇷🇼", dialCode: "+250" },
  { code: "SA", name: "Arabia Saudí", flag: "🇸🇦", dialCode: "+966" },
  { code: "SB", name: "Islas Salomón", flag: "🇸🇧", dialCode: "+677" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", dialCode: "+248" },
  { code: "SD", name: "Sudán", flag: "🇸🇩", dialCode: "+249" },
  { code: "SE", name: "Suecia", flag: "🇸🇪", dialCode: "+46" },
  { code: "SG", name: "Singapur", flag: "🇸🇬", dialCode: "+65" },
  { code: "SH", name: "Santa Elena", flag: "🇸🇭", dialCode: "+290" },
  { code: "SI", name: "Eslovenia", flag: "🇸🇮", dialCode: "+386" },
  { code: "SJ", name: "Svalbard y Jan Mayen", flag: "🇸🇯", dialCode: "+47" },
  { code: "SK", name: "Eslovaquia", flag: "🇸🇰", dialCode: "+421" },
  { code: "SL", name: "Sierra Leona", flag: "�🇱", dialCode: "+232" },
  { code: "SM", name: "San Marino", flag: "🇸🇲", dialCode: "+378" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", dialCode: "+221" },
  { code: "SO", name: "Somalia", flag: "🇸🇴", dialCode: "+252" },
  { code: "SR", name: "Surinam", flag: "🇸🇷", dialCode: "+597" },
  { code: "SS", name: "Sudán del Sur", flag: "🇸🇸", dialCode: "+211" },
  { code: "ST", name: "Santo Tomé y Príncipe", flag: "🇸🇹", dialCode: "+239" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", dialCode: "+503" },
  { code: "SX", name: "Sint Maarten", flag: "🇸🇽", dialCode: "+1" },
  { code: "SY", name: "Siria", flag: "🇸🇾", dialCode: "+963" },
  { code: "SZ", name: "Esuatini", flag: "🇸🇿", dialCode: "+268" },
  { code: "TC", name: "Islas Turcas y Caicos", flag: "�🇨", dialCode: "+1" },
  { code: "TD", name: "Chad", flag: "🇹🇩", dialCode: "+235" },
  { code: "TF", name: "Territorios Australes Franceses", flag: "🇹🇫", dialCode: "+262" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228" },
  { code: "TH", name: "Tailandia", flag: "🇹🇭", dialCode: "+66" },
  { code: "TJ", name: "Tayikistán", flag: "🇹🇯", dialCode: "+992" },
  { code: "TK", name: "Tokelau", flag: "🇹🇰", dialCode: "+690" },
  { code: "TL", name: "Timor Oriental", flag: "🇹🇱", dialCode: "+670" },
  { code: "TM", name: "Turkmenistán", flag: "🇹🇲", dialCode: "+993" },
  { code: "TN", name: "Túnez", flag: "🇹🇳", dialCode: "+216" },
  { code: "TO", name: "Tonga", flag: "🇹🇴", dialCode: "+676" },
  { code: "TR", name: "Turquía", flag: "🇹🇷", dialCode: "+90" },
  { code: "TT", name: "Trinidad y Tobago", flag: "🇹🇹", dialCode: "+1" },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻", dialCode: "+688" },
  { code: "TW", name: "Taiwán", flag: "🇹🇼", dialCode: "+886" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", dialCode: "+255" },
  { code: "UA", name: "Ucrania", flag: "🇺🇦", dialCode: "+380" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", dialCode: "+256" },
  { code: "UM", name: "Islas Ultramarinas de EE.UU.", flag: "🇺🇲", dialCode: "+1" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", dialCode: "+1" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598" },
  { code: "UZ", name: "Uzbekistán", flag: "🇺🇿", dialCode: "+998" },
  { code: "VA", name: "Ciudad del Vaticano", flag: "🇻🇦", dialCode: "+379" },
  { code: "VC", name: "San Vicente y las Granadinas", flag: "🇻🇨", dialCode: "+1" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58" },
  { code: "VG", name: "Islas Vírgenes Británicas", flag: "🇻🇬", dialCode: "+1" },
  { code: "VI", name: "Islas Vírgenes de EE.UU.", flag: "🇻🇮", dialCode: "+1" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dialCode: "+84" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", dialCode: "+678" },
  { code: "WF", name: "Wallis y Futuna", flag: "🇼🇫", dialCode: "+681" },
  { code: "WS", name: "Samoa", flag: "�🇸", dialCode: "+685" },
  { code: "YE", name: "Yemen", flag: "🇾🇪", dialCode: "+967" },
  { code: "YT", name: "Mayotte", flag: "🇾🇹", dialCode: "+262" },
  { code: "ZA", name: "Sudáfrica", flag: "🇿🇦", dialCode: "+27" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", dialCode: "+260" },
  { code: "ZW", name: "Zimbabue", flag: "🇿🇼", dialCode: "+263" },
]

interface CountryPhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  error?: string
}

export function CountryPhoneInput({
  value,
  onChange,
  placeholder = "Número de teléfono",
  className,
  required = false,
  error,
}: CountryPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtrar países basado en la búsqueda con debounce optimizado
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries.slice(0, 50) // Mostrar solo los primeros 50 por defecto
    
    const query = searchQuery.toLowerCase().trim()
    const filtered = countries.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    )
    
    return filtered.slice(0, 20) // Limitar a 20 resultados para mejor rendimiento
  }, [searchQuery])

  // Auto-focus en el campo de búsqueda cuando se abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Manejar teclas para navegación
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery("")
    }
  }, [])

  const formatPhoneNumber = (phone: string, format?: string) => {
    if (!format) return phone

    const numbers = phone.replace(/\D/g, "")
    let formatted = ""
    let numberIndex = 0

    for (let i = 0; i < format.length && numberIndex < numbers.length; i++) {
      if (format[i] === "#") {
        formatted += numbers[numberIndex]
        numberIndex++
      } else {
        formatted += format[i]
      }
    }

    return formatted
  }

  const handlePhoneChange = useCallback((phone: string) => {
    // Solo permitir números y limitar a exactamente 11 dígitos
    const numbers = phone.replace(/[^\d]/g, "")
    const limitedNumbers = numbers.slice(0, 11) // Máximo 11 dígitos
    
    onChange(`${selectedCountry.dialCode} ${limitedNumbers}`)
  }, [selectedCountry.dialCode, onChange])

  const handleCountryChange = useCallback((countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode) || countries[0]
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchQuery("")

    // Extraer solo los números (sin prefijo) y mantener máximo 11 dígitos
    const phoneNumbers = value.replace(/^\+\d+\s?/, "").replace(/[^\d]/g, "").slice(0, 11)
    onChange(`${country.dialCode} ${phoneNumbers}`)
  }, [value, onChange])

  const phoneWithoutCode = value.replace(/^\+\d+\s?/, "").replace(/[^\d]/g, "")

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative">
          <Select 
            value={selectedCountry.code} 
            onValueChange={handleCountryChange}
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open)
              if (!open) {
                setSearchQuery("")
              }
            }}
          >
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{selectedCountry.flag}</span>
                  <span className="text-xs font-medium">{selectedCountry.dialCode}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[320px] p-0" onKeyDown={handleKeyDown}>
              <div className="sticky top-0 z-10 bg-background p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Escribe para buscar país..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-8 h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                {searchQuery && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {filteredCountries.length} resultado(s) encontrado(s)
                  </div>
                )}
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  <>
                    {filteredCountries.map((country) => (
                      <SelectItem 
                        key={country.code} 
                        value={country.code} 
                        className="cursor-pointer focus:bg-accent/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm font-medium min-w-[60px]">{country.dialCode}</span>
                          <span className="text-sm text-muted-foreground truncate flex-1">{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {!searchQuery && filteredCountries.length === 50 && (
                      <div className="p-3 text-center text-xs text-muted-foreground border-t bg-muted/30">
                        Escribe para buscar más países...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <div className="text-sm text-muted-foreground">
                      No se encontraron países que coincidan con "{searchQuery}"
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Intenta buscar por nombre del país o código de área
                    </div>
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        <Input
          type="tel"
          placeholder={placeholder}
          value={phoneWithoutCode}
          onChange={(e) => handlePhoneChange(e.target.value)}
          required={required}
          className={cn("flex-1 min-w-0", error && "border-destructive")}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
