import { DropdownOption } from './DropdownOption';

export interface Project extends DropdownOption {
    rate: number;
    firstName: string;
    lastName: string;
    businessName: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: number | null;
    zipExtension: number | null;
    lockDate: Date | null;
}
