import akshare as ak
import pandas as pd
import datetime
import json
import os
import time
from pathlib import Path

class MarketVolumeTracker:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        # 确保数据目录存在
        Path(data_dir).mkdir(parents=True, exist_ok=True)
        self.today = datetime.datetime.now().strftime("%Y-%m-%d")
        self.hourly_data_file = os.path.join(data_dir, f"hourly_data_{self.today}.json")
        self.daily_data_file = os.path.join(data_dir, "daily_data.json")
        
    def fetch_market_data(self):
        """获取市场数据"""
        try:
            # 使用akshare获取沪深指数实时行情
            df = ak.stock_zh_index_spot_sina()
            
            # 提取上证指数和深证成指的数据
            sh_index = df[df['代码'] == 'sh000001'].iloc[0]
            sz_index = df[df['代码'] == 'sz399001'].iloc[0]
            
            # 计算沪深两市总成交额（单位：亿元）
            total_volume = (sh_index['成交额'] + sz_index['成交额']) / 100000000
            
            return {
                'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'sh_index': float(sh_index['最新价']),
                'sh_change_pct': float(sh_index['涨跌幅']),
                'sh_volume': float(sh_index['成交额'] / 100000000),  # 转换为亿元
                'sz_index': float(sz_index['最新价']),
                'sz_change_pct': float(sz_index['涨跌幅']),
                'sz_volume': float(sz_index['成交额'] / 100000000),  # 转换为亿元
                'total_volume': float(total_volume)
            }
        except Exception as e:
            print(f"获取市场数据时出错: {e}")
            return None
    
    def update_hourly_data(self):
        """更新每小时数据"""
        current_data = self.fetch_market_data()
        if not current_data:
            return
        
        # 读取现有数据或创建新数据
        if os.path.exists(self.hourly_data_file):
            with open(self.hourly_data_file, 'r', encoding='utf-8') as f:
                hourly_data = json.load(f)
        else:
            hourly_data = []
        
        # 添加当前数据
        current_hour = datetime.datetime.now().strftime("%H:00")
        current_data['hour'] = current_hour
        
        # 检查是否已有当前小时的数据，如果有则更新
        updated = False
        for i, data in enumerate(hourly_data):
            if data['hour'] == current_hour:
                hourly_data[i] = current_data
                updated = True
                break
        
        if not updated:
            hourly_data.append(current_data)
        
        # 保存数据
        with open(self.hourly_data_file, 'w', encoding='utf-8') as f:
            json.dump(hourly_data, f, ensure_ascii=False, indent=2)
        
        return hourly_data
    
    def update_daily_data(self):
        """更新每日数据"""
        # 读取现有数据或创建新数据
        if os.path.exists(self.daily_data_file):
            with open(self.daily_data_file, 'r', encoding='utf-8') as f:
                daily_data = json.load(f)
        else:
            daily_data = []
        
        # 检查是否已有今天的数据
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        today_data = None
        for data in daily_data:
            if data['date'] == today:
                today_data = data
                break
        
        # 如果没有今天的数据，且现在是收盘后，添加今天的数据
        current_hour = datetime.datetime.now().hour
        if not today_data and current_hour >= 15:  # 假设15点收盘
            current_data = self.fetch_market_data()
            if current_data:
                daily_entry = {
                    'date': today,
                    'total_volume': current_data['total_volume'],
                    'sh_index': current_data['sh_index'],
                    'sh_change_pct': current_data['sh_change_pct'],
                    'sz_index': current_data['sz_index'],
                    'sz_change_pct': current_data['sz_change_pct']
                }
                daily_data.append(daily_entry)
                
                # 保存数据
                with open(self.daily_data_file, 'w', encoding='utf-8') as f:
                    json.dump(daily_data, f, ensure_ascii=False, indent=2)
        
        return daily_data
    
    def get_hourly_data(self):
        """获取今日每小时数据"""
        if os.path.exists(self.hourly_data_file):
            with open(self.hourly_data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    
    def get_daily_data(self, days=30):
        """获取最近几天的每日数据"""
        if os.path.exists(self.daily_data_file):
            with open(self.daily_data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data[-days:] if len(data) > days else data
        return []

def run_server():
    """运行数据更新服务"""
    tracker = MarketVolumeTracker()
    
    # 初始更新
    hourly_data = tracker.update_hourly_data()
    daily_data = tracker.update_daily_data()
    
    # 将数据写入JSON文件，供前端读取
    with open('static/data/current_data.json', 'w', encoding='utf-8') as f:
        json.dump({
            'hourly_data': hourly_data,
            'daily_data': daily_data,
            'last_update': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }, f, ensure_ascii=False, indent=2)
    
    print(f"数据已更新，时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    # 确保静态数据目录存在
    Path("static/data").mkdir(parents=True, exist_ok=True)
    
    while True:
        try:
            run_server()
            # 每小时更新一次
            time.sleep(3600)
        except Exception as e:
            print(f"运行出错: {e}")
            time.sleep(300)  # 出错后5分钟重试 