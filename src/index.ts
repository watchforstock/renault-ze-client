import 'isomorphic-fetch';

interface IChargingResponse {
  charging: boolean;
  plugged: boolean;
  charge_level: number;
  remaining_range: number;
  last_update: number;
  charging_point: string;
}

interface IUserResponse {
  id: string;
  locale: string;
  country: string;
  timezone: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  vehicle_details: IVehicleDetails;
  scopes: string[];
  active_account: string;
  associated_vehicles: IVehicle[];
  gdc_uid: string;
}

interface IVehicle {
  VIN: string;
  activation_code: string;
  user_id: string;
}

interface IVehicleDetails {
  timezone: string;
  VIN: string;
  activation_code: string;
  phone_number: string;
}

interface ILoginResponse {
  token: string;
  xsrfToken: string;
  user: IUserResponse;
}

export default class ZEServices {
  public token: string = '';
  public vin: string = '';

  public login(username: string, password: string): Promise<ILoginResponse> {
    const body = {
      username,
      password,
    };

    return new Promise((resolve, reject) => {
      fetch('https://www.services.renault-ze.com/api/user/login', {
        credentials: 'omit',
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,en-GB;q=0.8',
          'content-type': 'application/json;charset=UTF-8',
        },
        referrer: 'https://www.services.renault-ze.com/user/login',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
      })
        .then(resp => {
          resp
            .json()
            .then(val => {
              this.token = val.token;
              this.vin = val.user.vehicle_details.VIN;
              resolve(val);
            })
            .catch(err => {
              reject(false);
            });
        })
        .catch(err => {
          reject(false);
        });
    });
  }

  public chargingDetails(): Promise<IChargingResponse> {
    return new Promise((resolve, reject) => {
      fetch('https://www.services.renault-ze.com/api/vehicle/' + this.vin + '/battery', {
        credentials: 'include',
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,en-GB;q=0.8',
          authorization: 'Bearer ' + this.token,
        },
        referrer: 'https://www.services.renault-ze.com/user/login',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: null,
        method: 'GET',
        mode: 'cors',
      })
        .then(resp => {
          resolve(resp.json());
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // startTime should be specified as a string in the format "HHMM", e.g. "0730"
  public setACScheduler(startTime: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const body = { start: startTime };

      fetch('https://www.services.renault-ze.com/api/vehicle/' + this.vin + '/air-conditioning/scheduler', {
        credentials: 'include',
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9,en-GB;q=0.8',
          authorization: 'Bearer ' + this.token,
          'content-type': 'application/json;charset=UTF-8',
        },
        referrer: 'https://www.services.renault-ze.com/',
        referrerPolicy: 'no-referrer-when-downgrade',
        body: JSON.stringify(body),
        method: 'POST',
        mode: 'cors',
      })
        .then(resp => {
          resolve(startTime);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
