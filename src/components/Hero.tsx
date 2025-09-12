import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Shield, Bell, MapPin } from 'lucide-react';
import heroImage from '@/assets/hero-train.jpg';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 bg-black/20"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
            Slut på stress vid
            <span className="block text-accent"> trafikstörningar</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
            Störningskollen bevakar din resa och berättar exakt vad som händer, varför det händer och vad du ska göra när det händer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="accent" size="lg" className="text-lg px-8">
              Kom igång nu
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
              Se hur det fungerar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-primary-foreground/10 rounded-full">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Proaktiva notiser</h3>
              <p className="text-sm text-primary-foreground/80">Du får reda på störningar innan de påverkar dig</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-primary-foreground/10 rounded-full">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Komplett information</h3>
              <p className="text-sm text-primary-foreground/80">Allt du behöver veta på ett ställe</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 bg-primary-foreground/10 rounded-full">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Ersättningstrafik</h3>
              <p className="text-sm text-primary-foreground/80">Hitta och navigera till alternativa lösningar</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-primary-foreground/60" />
      </div>
    </section>
  );
};

export default Hero;