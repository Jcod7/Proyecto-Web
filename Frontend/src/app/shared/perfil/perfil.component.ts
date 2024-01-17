import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { CarritoService } from 'src/app/services/carrito.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  user: User = {};
  editedUser: Partial<User> = {};
  cedulaUsuario: string | null = null;
  editMode = false;
  historialPagos: any[] = [];
  bicicletaSeleccionada: any[] = [];

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
    private carritoService: CarritoService,
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    this.userService.getCedulaUsuario().subscribe(cedula => {
      this.cedulaUsuario = cedula;
    });

    this.userService.getUserDetails(this.cedulaUsuario).subscribe(
      (user) => {
        this.user = user;
      },
      (error) => {
        this.notificationService.notify('Algo salió mal, intente más tarde.', 2000);
      }
    );
    this.onGetAlquilerByCedula()
  }

  enableEditMode(): void {
    // Copia los datos del usuario a editedUser
    this.editedUser = { ...this.user };
    this.editMode = true;
  }

  saveChanges(): void {
    // Realiza la solicitud de actualización al servicio
    this.userService.updateUserDetails(this.cedulaUsuario, this.editedUser).subscribe(
      () => {
        this.notificationService.notify('Cambios guardados correctamente', 2000);
        this.editMode = false;
        // Actualiza los datos del usuario después de guardar los cambios
        this.userService.getUserDetails(this.cedulaUsuario).subscribe(
          (user) => {
            this.user = user;
          },
          (error) => {
            this.notificationService.notify('Error al cargar los datos del usuario', 2000);
          }
        );
      },
      (error) => {
        this.notificationService.notify('Error al guardar cambios', 2000);
      }
    );
  }
  Logout() {
    localStorage.removeItem('token')
    this.router.navigate(['/inicio']);
  }

  onGetAlquilerByCedula(): void {
    this.carritoService.getAlquilerByCedula(this.cedulaUsuario).subscribe(
      (alquiler: any) => {
        this.historialPagos = alquiler
        console.log('Estado del Alquiler:', alquiler);
        console.log('Estado del :', this.historialPagos);
        if (this.historialPagos.length > 0) {
          this.obtenerInformacionBicicleta(this.historialPagos[0].BikeID);
        }

      }, error => {
        console.error('Error al obtener el alquiler por cédula:', error);
      }
    );
  }

  obtenerInformacionBicicleta(bikeId: number): void {
    this.productService.getProductById(bikeId).subscribe(
      (bicicleta: any) => {
        this.bicicletaSeleccionada = bicicleta;
      },
      error => {
        console.error('Error al obtener la información de la bicicleta:', error);
      }
    );
  }

}