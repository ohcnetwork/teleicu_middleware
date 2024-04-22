import type { AssetType } from "@prisma/client";


export interface AssetConfig {
  id: string;
  name: string;
  type: AssetType;
  description?: string;
  ip_address: string;
  access_key?: string;
  username?: string;
  password?: string;
  port?: number;
}

export type AssetBed = {
  id: string;
  bed_object: {
    id: string;
    name: string;
    bed_type: "ICU" | "WARD";
    location_object: {
      id: string;
      facility: {
        id: string;
        name: string;
      };
      location_type: "OTHER" | "WARD" | "ICU";
      created_date: string;
      modified_date: string;
      name: string;
      description: string;
      middleware_address: string | null;
    };
    is_occupied: boolean;
    created_date: string;
    modified_date: string;
    description: string;
    meta: any;
  };
  asset_object: {
    id: string;
    status: "ACTIVE" | "INACTIVE";
    asset_type: "INTERNAL" | "EXTERNAL";
    location_object: {
      id: string;
      facility: {
        id: string;
        name: string;
      };
      location_type: "OTHER" | "WARD" | "ICU";
      created_date: string;
      modified_date: string;
      name: string;
      description: string;
      middleware_address: string | null;
    };
    last_service: string | null;
    resolved_middleware: {
      hostname: string;
      source: string;
    };
    created_date: string;
    modified_date: string;
    name: string;
    description: string;
    asset_class: "ONVIF" | "HL7MONITOR" | "VENTILATOR";
    is_working: boolean;
    not_working_reason: string;
    serial_number: string;
    warranty_details: string;
    meta: {
      asset_type: "CAMERA" | "MONITOR" | "VENTILATOR";
      local_ip_address: string;
      camera_access_key: string;
    };
    vendor_name: string;
    support_name: string;
    support_phone: string;
    support_email: string;
    qr_code_id: string | null;
    manufacturer: string | null;
    warranty_amc_end_of_validity: string | null;
  };
  created_date: string;
  modified_date: string;
  meta: {
    error: string;
    bed_id: string;
    utcTime: string;
    position: { x: number; y: number; zoom: number };
    moveStatus: { zoom: "IDLE" | "MOVING"; panTilt: "IDLE" | "MOVING" };
    preset_name: string;
  };
};