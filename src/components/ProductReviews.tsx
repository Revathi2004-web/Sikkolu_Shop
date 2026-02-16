import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  review: string;
  created_at: string;
}

interface ProductReviewsProps {
  productName: string;
}

const ProductReviews = ({ productName }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_name', productName)
      .order('created_at', { ascending: false });
    setReviews(data || []);
  };

  useEffect(() => {
    fetchReviews();
  }, [productName]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .maybeSingle();

    const { error } = await supabase.from('product_reviews').insert({
      product_name: productName,
      user_id: user.id,
      user_name: profile?.name || 'Customer',
      rating,
      review: reviewText.trim().slice(0, 500),
    });

    if (error) toast.error('Failed to submit review');
    else {
      toast.success('Review submitted! ⭐');
      setRating(0);
      setReviewText('');
      setShowForm(false);
      fetchReviews();
    }
    setSubmitting(false);
  };

  const renderStars = (count: number, size = 'w-4 h-4') => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${size} ${i <= count ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {avgRating && (
            <>
              {renderStars(Math.round(Number(avgRating)))}
              <span className="text-sm font-medium">{avgRating}</span>
              <span className="text-xs text-muted-foreground">({reviews.length})</span>
            </>
          )}
          {!avgRating && <span className="text-xs text-muted-foreground">No reviews yet</span>}
        </div>
        {user && (
          <Button size="sm" variant="outline" className="text-xs rounded-lg h-7" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '✍️ Write Review'}
          </Button>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div className="bg-accent rounded-xl p-3 space-y-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
                className="touch-manipulation"
              >
                <Star className={`w-6 h-6 ${i <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
          <Input
            placeholder="Write your review (optional)"
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            className="rounded-lg text-sm"
            maxLength={500}
          />
          <Button size="sm" className="rounded-lg text-xs" onClick={handleSubmit} disabled={submitting || rating === 0}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.slice(0, 3).map(r => (
        <div key={r.id} className="border-t border-border pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{r.user_name}</span>
            {renderStars(r.rating, 'w-3 h-3')}
          </div>
          {r.review && <p className="text-xs text-muted-foreground mt-1">{r.review}</p>}
        </div>
      ))}
      {reviews.length > 3 && (
        <p className="text-xs text-muted-foreground text-center">+{reviews.length - 3} more reviews</p>
      )}
    </div>
  );
};

export default ProductReviews;
