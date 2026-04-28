import json, os, sys
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
import pymysql

DESTINATIONS = [
  {"dest_id":"beijing","name":"Beijing","country":"China","region":"Asia","tag":"History","lat":39.90,"lon":116.40,"img":"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80","description":"Capital of China","highlights":["Palace","Wall"],"food":["Duck","Noodles"],"best_time":"Apr-May","flights":"Domestic","sort_order":1},
]

conn = pymysql.connect(host=os.getenv("DB_HOST","127.0.0.1"),port=int(os.getenv("DB_PORT",3306)),user=os.getenv("DB_USER","root"),password=os.getenv("DB_PASSWORD"),database=os.getenv("DB_DATABASE"),charset="utf8mb4",cursorclass=pymysql.cursors.DictCursor)
with conn.cursor() as cur:
    for d in DESTINATIONS:
        cur.execute("INSERT INTO t_destinations (dest_id,name,country,region,tag,lat,lon,img,description,highlights,food,best_time,flights,sort_order) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON DUPLICATE KEY UPDATE name=VALUES(name),country=VALUES(country),region=VALUES(region),tag=VALUES(tag),lat=VALUES(lat),lon=VALUES(lon),img=VALUES(img),description=VALUES(description),highlights=VALUES(highlights),food=VALUES(food),best_time=VALUES(best_time),flights=VALUES(flights),sort_order=VALUES(sort_order)",(d["dest_id"],d["name"],d["country"],d["region"],d["tag"],d["lat"],d["lon"],d["img"],d["description"],json.dumps(d["highlights"],ensure_ascii=False),json.dumps(d["food"],ensure_ascii=False),d["best_time"],d["flights"],d["sort_order"]))
conn.commit()
conn.close()
print("Done: " + str(len(DESTINATIONS)) + " destinations")
