// import { useState } from 'react';
// import { Header } from '@/components/Header';
// import { HeroSection } from '@/components/HeroSection';
// import { CollageCanvas } from '@/components/CollageCanvas';
// import { TshirtPreview } from '@/components/TshirtPreview';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// const Index = () => {
//   const [activeTab, setActiveTab] = useState('create');

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
      
//       {activeTab === 'home' && <HeroSection />}
      
//       <main className="container mx-auto px-4 py-8">
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid w-full grid-cols-3 mb-8">
//             <TabsTrigger value="home">Home</TabsTrigger>
//             <TabsTrigger value="create">Create Collage</TabsTrigger>
//             <TabsTrigger value="preview">Preview & Order</TabsTrigger>
//           </TabsList>

//           <TabsContent value="home">
//             <HeroSection />
//           </TabsContent>

//           <TabsContent value="create" className="space-y-8">
//             <div className="text-center space-y-4">
//               <h2 className="text-3xl font-bold">Design Your Collage</h2>
//               <p className="text-muted-foreground max-w-2xl mx-auto">
//                 Create stunning hexagonal photo collages using our intuitive canvas editor. 
//                 Upload your photos and arrange them to tell your unique story.
//               </p>
//             </div>
//             <CollageCanvas />
//           </TabsContent>

//           <TabsContent value="preview" className="space-y-8">
//             <div className="text-center space-y-4">
//               <h2 className="text-3xl font-bold">Preview Your Design</h2>
//               <p className="text-muted-foreground">
//                 See how your collage will look on a premium t-shirt before ordering.
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <TshirtPreview />
              
//               <Card className="p-6 bg-gradient-card shadow-elegant">
//                 <h3 className="text-xl font-semibold mb-4">Order Details</h3>
//                 <div className="space-y-4">
//                   <div className="flex justify-between">
//                     <span>Premium Cotton T-Shirt</span>
//                     <span className="font-semibold">₹999</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Custom Collage Print</span>
//                     <span className="font-semibold">₹499</span>
//                   </div>
//                   <div className="border-t pt-4 flex justify-between text-lg font-bold">
//                     <span>Total</span>
//                     <span>₹1,498</span>
//                   </div>
//                   <Button className="w-full" size="lg">
//                     Add to Cart
//                   </Button>
//                 </div>
//               </Card>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </main>
//     </div>
//   );
// };

// export default Index;

