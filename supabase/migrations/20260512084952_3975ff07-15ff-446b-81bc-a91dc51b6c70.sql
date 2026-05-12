INSERT INTO public.extra_chore_templates (title, category, credits, estimated_time, description, supervised_only)
VALUES
  ('Help carry groceries', 'Home', 200, '~20 mins', 'Help bring groceries from the car or store.', false),
  ('Water the plants', 'Home', 150, '~10 mins', 'Water all the indoor and outdoor plants.', false),
  ('Wash the car', 'Home', 500, '~45 mins', 'Rinse, soap, and dry the family car.', true),
  ('Organize the pantry', 'Home', 300, '~30 mins', 'Sort and organize items in the kitchen pantry.', false),
  ('Walk the dog', 'Pet Care', 250, '~30 mins', 'Take the dog for a walk around the neighborhood.', true),
  ('Feed the pets', 'Pet Care', 100, '~5 mins', 'Feed and give fresh water to all pets.', false),
  ('Help cook dinner', 'Kitchen', 400, '~40 mins', 'Help a parent prepare and cook dinner.', true),
  ('Wash the dishes', 'Kitchen', 200, '~20 mins', 'Wash and dry all dishes after a meal.', false),
  ('Recycle sorting', 'Environment', 150, '~15 mins', 'Sort recyclables into the correct bins.', false);