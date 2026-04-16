import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// jeep-sqlite v8 has its own loader (no longer re-exported from @capacitor-community/sqlite)
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { defineCustomElements as ionicPwaElements } from '@ionic/pwa-elements/loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Initialize loaders
jeepSqlite(window);
ionicPwaElements(window);

const setupApp = async () => {
  // Create and append the mandatory <jeep-sqlite> element
  const jeepEl = document.createElement('jeep-sqlite');
  document.body.appendChild(jeepEl);
  
  try {
    await customElements.whenDefined('jeep-sqlite');

    await bootstrapApplication(AppComponent, {
      providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(),
        provideRouter(routes),
      ],
    });
    console.log('App Bootstrapped Successfully');
  } catch (err) {
    console.error('Bootstrap Error:', err);
  }
};

setupApp();