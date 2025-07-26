import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Edit } from 'lucide-react';
import { TShirtConfig } from '@/pages/Preview';

interface PreviewSummaryProps {
  config: TShirtConfig;
  onProceedToCheckout: () => void;
}

export const PreviewSummary: React.FC<PreviewSummaryProps> = ({
  config,
  onProceedToCheckout
}) => {
  const getStyleName = (style: string) => {
    switch (style) {
      case 'round-neck': return 'Round Neck';
      case 'polo': return 'Polo';
      case 'oversized': return 'Oversized';
      default: return style;
    }
  };

  const getColorName = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#ffffff': 'White',
      '#000000': 'Black',
      '#1e3a8a': 'Navy',
      '#dc2626': 'Red',
      '#16a34a': 'Green',
      '#7c3aed': 'Purple'
    };
    return colorMap[color] || 'Custom';
  };

  const basePrice = 25;
  const quantity = 1;
  const total = basePrice * quantity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Design Summary */}
        <div className="space-y-2">
          <h4 className="font-medium">Design Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Style: {getStyleName(config.style)}</div>
            <div>Color: {getColorName(config.color)}</div>
            <div>Size: {config.size}</div>
            <div>View: {config.view === 'front' ? 'Front' : 'Back'}</div>
            {config.quote && <div>Quote: "{config.quote}"</div>}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Base Price</span>
            <span>${basePrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="flex justify-between font-medium text-lg border-t pt-2 mt-2">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <Button
            onClick={onProceedToCheckout}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Place Order
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <Edit className="w-5 h-5 mr-2" />
            Back to Preview
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 pt-2">
          <p>• High-quality cotton blend</p>
          <p>• Professional printing</p>
          <p>• 7-14 day delivery</p>
        </div>
      </CardContent>
    </Card>
  );
};
