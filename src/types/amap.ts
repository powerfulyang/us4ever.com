interface BaseResponse {
  status: string
  info: string
  infocode: string
}

export interface Regeocode {
  regeocode: {
    addressComponent: AddressComponent
    formatted_address: string
  }
}

export interface AddressComponent {
  adcode: string
  building: Building
  businessAreas: BusinessArea[]
  city: any[]
  citycode: string
  country: string
  district: string
  neighborhood: Neighborhood
  province: string
  streetNumber: StreetNumber
  towncode: string
  township: string
}

export interface Building {
  name: any[]
  type: any[]
}

export interface BusinessArea {
  id: string
  location: string
  name: string
}

export interface Neighborhood {
  name: string
  type: string
}

export interface StreetNumber {
  direction: string
  distance: string
  location: string
  number: string
  street: string
}

export interface AmapRegeoCode extends BaseResponse, Regeocode {}
