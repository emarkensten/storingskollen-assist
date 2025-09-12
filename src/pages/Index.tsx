import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrainSearch from '@/components/TrainSearch';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Börja bevaka din resa</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Lägg in din resa så håller vi koll på eventuella störningar och meddelar dig omedelbart om något händer.
            </p>
          </div>
          <TrainSearch />
        </div>
      </section>

      <Dashboard />
    </div>
  );
};

export default Index;
