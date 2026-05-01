import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

class ElectionFFN(nn.Module):
    """Feedforward Neural Network for complex non-linear relationships"""
    def __init__(self, input_dim, output_dim=1, task='regression'):
        super(ElectionFFN, self).__init__()
        self.task = task
        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, output_dim)
        )
        if task == 'classification':
            self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        x = self.network(x)
        if self.task == 'classification':
            x = self.softmax(x)
        return x

class ElectionLSTM(nn.Module):
    """LSTM for temporal trends (Sequential Election Evolution)"""
    def __init__(self, input_dim, hidden_dim=64, num_layers=2):
        super(ElectionLSTM, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_dim, 1)

    def forward(self, x):
        # x shape: (batch, seq_len, input_dim)
        out, _ = self.lstm(x)
        # Take the output of the last time step
        out = self.fc(out[:, -1, :])
        return out

class DLTrainer:
    def __init__(self, model):
        self.model = model
        self.criterion = nn.MSELoss() if getattr(model, 'task', 'regression') == 'regression' else nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.001, weight_decay=1e-5)

    def train(self, X_train, y_train, epochs=100, batch_size=32):
        X_tensor = torch.tensor(X_train, dtype=torch.float32)
        if isinstance(self.model, ElectionLSTM):
            # Expect X_train to be 3D: (samples, time_steps, features)
            pass
        
        y_dtype = torch.float32 if getattr(self.model, 'task', 'regression') == 'regression' else torch.long
        y_tensor = torch.tensor(y_train, dtype=y_dtype)
        if y_dtype == torch.float32:
            y_tensor = y_tensor.view(-1, 1)
        
        dataset = TensorDataset(X_tensor, y_tensor)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

        self.model.train()
        for epoch in range(epochs):
            total_loss = 0
            for batch_X, batch_y in loader:
                self.optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = self.criterion(outputs, batch_y)
                loss.backward()
                self.optimizer.step()
                total_loss += loss.item()
            
            if (epoch+1) % 20 == 0:
                print(f"Epoch {epoch+1}/{epochs}, Average Loss: {total_loss/len(loader):.4f}")

    def predict(self, X):
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.tensor(X, dtype=torch.float32)
            return self.model(X_tensor).numpy().flatten()
