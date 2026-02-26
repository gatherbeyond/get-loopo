import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const TestSupabase = () => {
  const [families, setFamilies] = useState<Tables<"families">[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilies = async () => {
      const { data, error } = await supabase.from("families").select("*");
      if (error) {
        setError(error.message);
      } else {
        setFamilies(data ?? []);
      }
      setLoading(false);
    };
    fetchFamilies();
  }, []);

  if (loading) return <p className="p-4 text-muted-foreground">Loading...</p>;
  if (error) return <p className="p-4 text-destructive">Error: {error}</p>;

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-lg font-bold text-foreground">Families</h2>
      {families.length === 0 ? (
        <p className="text-muted-foreground">No families found.</p>
      ) : (
        families.map((f) => (
          <div key={f.id} className="rounded-lg border p-3">
            <p className="font-semibold text-foreground">{f.family_name}</p>
            <p className="text-sm text-muted-foreground">Code: {f.family_code}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default TestSupabase;
