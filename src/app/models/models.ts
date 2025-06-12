export interface Maker {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  ext_name?: string;
  address: string;
  phone_num: string;
  birthdate: string;
  age: number;
  dept?: string;
  position?: string;
  salary?: number;
  ee_status?: string;
  years_coop?: string;
  share_amount?: number;
  saving_amount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comaker {
  id: number;
  co_first_name: string;
  co_middle_name?: string;
  co_last_name: string;
  co_ext_name?: string;
  co_address: string;
  co_phone_num: string;
  co_birthdate: string;
  co_age: number;
  co_dept?: string;
  co_position?: string;
  co_salary?: number;
  co_ee_status?: string;
  co_years_coop?: string;
  co_share_amount?: number;
  co_saving_amount?: number;
  createdAt?: string;
  updatedAt?: string;
}