import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { HttpserviceService } from './httpservice.service';

@Injectable({
  providedIn: 'root'
})
export class TokeninterceptorserviceService implements HttpInterceptor{

  constructor(private injector: Injector) { } // we'll get an instance of the http service here
  // in a little bit different way! we won't just inject the http service into the constructor like we did
  // anywhere else in the code but we'll have an instance of it via the injector!

  // now by asking the class to implement an interface we have to define an intercept method !
// next parameter pass on the execution ... !!!
intercept(req, next) { // anti na kanoume inject to http service ston constructor to kanoume inject meso
  // tou injector dioti se auto edo to service kanoume implement to http interceptor interface
  const http = this.injector.get(HttpserviceService); // now we can use this to get the token !!!
  // tslint:disable-next-line: max-line-length
  if (req.url !== 'http://localhost:5000/api/orgnamesfromthirdpartyapi') { // otan i klisi ginetai sto 3rd party api den prepei na kanoume intercept kai na epikolame sto header tou request to authorization property giati den dexetai authorization headers to 3rd party api
  const tokenizedReq = req.clone({
    setHeaders: {
      // this token below gets retrieved from localstorage via a method in the httpservice and then the retrieved
      // token is sent via the http interceptor here to the backend for verification in the verifytoken middleware
      Authorization: `Bearer ${http.getToken()}`
    }
  });

  return next.handle(tokenizedReq); // o interceptor pairnei to request pou theloume na steiloume
  // sto backend kai tou bazei os headers to token pou mas eixe steilei o server kai eixame apothikausei
  // sto localstorage. To stelnoume loipon piso pali sto backend meso tou interceptor gia verification
  // ki epeita na ginei to authentication kai na exoume access sti selida pou kanoume login
}
  // tslint:disable-next-line: max-line-length
  return next.handle(req); // an den bei sto if simainei oti to request ginetai sto 3rd party api opote apla sinexizoume me ti next to taksidi tou request xoris na kanoume intercept
}



}
