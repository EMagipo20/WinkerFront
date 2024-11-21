import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const segGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
    const lService=inject(AuthService)
    const router=inject(Router)
    const rpta=lService.verificar();
    if(!rpta){
      router.navigate(['/login']);
      return false;
    }
    return rpta;
};