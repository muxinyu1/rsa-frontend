<template>
    <v-container>
        <v-form>
            <v-row>
                <v-col>
                    <h1>RSA 小工具</h1>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-select v-model="keySize" :items="keySizes" label="密钥位数"></v-select>
                    <v-btn @click="generateKeys" color="primary" class="mr-2">生成密钥对</v-btn>
                    <v-btn @click="exportKeys" color="primary" class="mr-2">导出密钥对</v-btn>
                    <v-file-input @change="handleFileUpload" color="primary" label="导入密钥对"
                        accept=".json"></v-file-input>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-textarea v-model="publicKey" label="公钥（加密）" rows="8" placeholder="公钥" readonly></v-textarea>
                </v-col>
                <v-col>
                    <v-textarea v-model="privateKey" label="私钥（解密）" rows="8" placeholder="私钥" readonly></v-textarea>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-textarea v-model="inputText" label="请输入需要加密/解密的文本" rows="8"
                        placeholder="请输入需要加密/解密的文本"></v-textarea>
                </v-col>
                <v-col>
                    <v-textarea v-model="signedText" label="签名后的密文" rows="8" readonly></v-textarea>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-btn @click="encrypt" color="primary" class="mr-2">加密</v-btn>
                    <v-btn @click="decrypt" color="primary" class="mr-2">解密</v-btn>
                    <v-btn @click="sign" color="primary" class="mr-2">签名</v-btn>
                    <v-btn @click="verify" color="primary" class="mr-2">验证</v-btn>
                    <v-btn @click="swapText" color="primary" class="mr-2">↕ 交换</v-btn>
                    <v-btn @click="clearOutput" color="primary" class="mr-2">清空输出</v-btn>
                </v-col>
            </v-row>

            <v-row>
                <v-col>
                    <v-textarea v-model="outputText" label="输出" rows="8" placeholder="输出" readonly></v-textarea>
                </v-col>
            </v-row>
        </v-form>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" multi-line>
            {{ snackbarMessage }}
            <template #action="{ attrs }">
                <v-btn color="white" text v-bind="attrs" @click="snackbar = false">关闭</v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="js">
import axios from 'axios';

export default {
    data() {
        return {
            keySize: '512',
            keySizes: ['512', '1024', '2048'],
            publicKey: '',
            privateKey: '',
            inputText: '',
            outputText: '',
            signedText: '',
            snackbar: false,
            snackbarMessage: '',
            snackbarColor: 'success',
        };
    },
    methods: {
        generateKeys() {
            const len = parseInt(this.keySize, 10);
            axios.get(`/proxy/api/keygen/${len}`).then(response => {
                if (response.status == 200) {
                    this.publicKey = response.data.keys.public_key;
                    this.privateKey = response.data.keys.private_key;
                    this.showSnackbar('密钥对生成成功！');
                } else {
                    this.showSnackbar('状态码不是200，生成失败！', 'error');
                }
            }).catch(error => {
                this.showSnackbar(`请求出错：${error}`, 'error');
            });
        },
        showSnackbar(message, color = 'success') {
            this.snackbarMessage = message;
            this.snackbarColor = color;
            this.snackbar = true;
        },
        encrypt() {
            // 加密的逻辑
            if (this.publicKey.length == 0 || this.privateKey.length == 0) {
                this.showSnackbar("请先生成密钥对", 'error');
                return;
            }
            if (this.inputText.length == 0) {
                this.showSnackbar("请输入要加密的文本", 'error');
                return;
            }
            axios.post('/proxy/api/encrypt', {
                "message": this.inputText,
                "public_key": this.publicKey
            }).then(response => {
                if (response.status == 200) {
                    this.outputText = response.data.ciphertext;
                    this.showSnackbar("已生成密文");
                } else {
                    this.showSnackbar('出错：状态码不是200', 'error');
                }
            }).catch(error => {
                this.showSnackbar(`请求出错：${error}`, "error");
            });
        },
        decrypt() {
            // 解密的逻辑
            if (this.publicKey.length == 0 || this.privateKey.length == 0) {
                this.showSnackbar("请先生成密钥对", 'error');
                return;
            }
            if (this.inputText.length == 0) {
                this.showSnackbar("请输入要解密的文本", 'error');
                return;
            }
            axios.post('/proxy/api/decrypt', {
                "ciphertext": this.inputText,
                "public_key": this.publicKey,
                "private_key": this.privateKey
            }).then(response => {
                if (response.status == 200) {
                    this.outputText = response.data.message;
                    this.showSnackbar("已生成明文");
                } else {
                    this.showSnackbar('请检查输入的密文是否有误', 'error');
                }
            }).catch(_ => {
                this.showSnackbar(`请检查输入的密文是否有误`, "error");
            });
        },
        sign() {
            // 签名的逻辑
            if (this.publicKey.length == 0 || this.privateKey.length == 0) {
                this.showSnackbar("请先生成密钥对", 'error');
                return;
            }
            if (this.inputText.length == 0) {
                this.showSnackbar("请输入要签名的文本", 'error');
                return;
            }
            axios.post('/proxy/api/sign', {
                "message": this.inputText,
                "public_key": this.publicKey,
                "private_key": this.privateKey
            }).then(response => {
                if (response.status == 200) {
                    this.signedText = response.data.message_signed;
                    this.showSnackbar("已签名");
                } else {
                    this.showSnackbar('签名失败', 'error');
                }
            }).catch(error => {
                this.showSnackbar(`请求出错：${error}`, "error");
            });
        },
        verify() {
            // 验证的逻辑
            if (this.publicKey.length == 0 || this.privateKey.length == 0) {
                this.showSnackbar("请先生成密钥对", 'error');
                return;
            }
            if (this.inputText.length == 0) {
                this.showSnackbar("请输入要验证的文本", 'error');
                return;
            }
            if (this.signedText.length == 0) {
                this.showSnackbar("请先签名", "error");
                return;
            }
            axios.post('/proxy/api/verify_sign', {
                "message": this.inputText,
                "message_signed": this.signedText,
                "public_key": this.publicKey,
            }).then(response => {
                if (response.status == 200) {
                    if (response.data.verified) {
                        this.showSnackbar("验证成功");
                    } else {
                        this.showSnackbar("验证失败", "error");
                    }
                } else {
                    this.showSnackbar('验证失败', 'error');
                }
            }).catch(error => {
                this.showSnackbar(`请求出错：${error}`, "error");
            });
        },
        swapText() {
            const temp = this.inputText;
            this.inputText = this.outputText;
            this.outputText = temp;
        },
        clearOutput() {
            this.outputText = ''
        },
        exportKeys() {
            if (this.publicKey.length == 0 || this.privateKey.length == 0) {
                this.showSnackbar("请先生成密钥对", 'error');
                return;
            }
            const keys = {
                "public_key": this.publicKey,
                "private_key": this.privateKey
            };
            const blob = new Blob([JSON.stringify(keys, null, 4)], { type: 'text/plain;charset=utf-8' }); // 创建 Blob 对象
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'keys.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
        importKeys(keys) {
            this.publicKey = keys.public_key;
            this.privateKey = keys.private_key;
        },
        handleFileUpload(event) {
            const file = event.target.files[0]; // 获取上传的文件
            if (file) {
                const reader = new FileReader(); // 创建 FileReader 实例

                reader.onload = (e) => {
                    const fileContent = e.target.result.replace(/^\uFEFF/, ''); // 获取文件内容
                    // console.log(fileContent)
                    try {
                        const keys = JSON.parse(fileContent); // 反序列化为对象
                        this.importKeys(keys); // 处理解析后的数据
                    } catch (error) {
                        console.error("文件内容不是有效的 JSON 格式", error);
                    }
                };

                reader.readAsText(file); // 以文本形式读取文件
            }
        }
    }
};
</script>

<style scoped></style>
