while IFS='=' read -r key value; do
  gh secret set "$key" -b"$value" --env UAT
done < .env.production