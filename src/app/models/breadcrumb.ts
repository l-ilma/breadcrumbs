import { Observable } from 'rxjs';

export interface Breadcrumb {
  key: string;
  label$: Observable<string>;
  url: string;
}
