import { Component, OnInit } from '@angular/core';

/**
 * Rappresenta il logo dell'applicazione.
 * Questa componente fornisce una immagine ben costruita del logo da utilizzare nelle altre componenti.
 */
@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css'],
})
export class LogoComponent implements OnInit {
  /**
   * La componente non ha alcuna dipedenza, il costruttore viene solamente dichiarato
   */
  constructor() {}

  /**
   * Essendo logo una componente ausiliare per gestire la creazione dell'immagine del logo, non è necessaria
   * alcuna inizializzazione
   */
  ngOnInit(): void {}
}
