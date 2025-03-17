from flask import Flask, render_template, jsonify
import os
from market_volume_tracker import MarketVolumeTracker
import threading
import time
import datetime
import json

app = Flask(__name__)
tracker = MarketVolumeTracker()

# 后台数据更新线程
def update_data_thread():
    while True:
        try:
            # 更新数据
            hourly_data = tracker.update_hourly_data()
            daily_data = tracker.update_daily_data()
            
            # 将数据写入JSON文件
            os.makedirs('static/data', exist_ok=True)
            with open('static/data/current_data.json', 'w', encoding='utf-8') as f:
                json.dump({
                    'hourly_data': hourly_data,
                    'daily_data': daily_data,
                    'last_update': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }, f, ensure_ascii=False, indent=2)
            
            print(f"数据已更新，时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # 每小时更新一次
            time.sleep(3600)
        except Exception as e:
            print(f"更新数据时出错: {e}")
            time.sleep(300)  # 出错后5分钟重试

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    hourly_data = tracker.get_hourly_data()
    daily_data = tracker.get_daily_data()
    
    return jsonify({
        'hourly_data': hourly_data,
        'daily_data': daily_data,
        'last_update': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })

if __name__ == '__main__':
    # 确保静态数据目录存在
    os.makedirs('static/data', exist_ok=True)
    
    # 启动数据更新线程
    update_thread = threading.Thread(target=update_data_thread)
    update_thread.daemon = True
    update_thread.start()
    
    # 启动Flask应用
    app.run(debug=True, host='0.0.0.0', port=5000) 