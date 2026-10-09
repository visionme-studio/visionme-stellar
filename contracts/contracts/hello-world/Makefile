WASM_TARGET := wasm32-unknown-unknown
WASM_DIR := target/$(WASM_TARGET)/release
WASM_FILE := $(WASM_DIR)/hello-world.wasm

.PHONY: build optimize clean target

build:		stellar contract build --package hello-world

optimize:	$(WASM_DIR)/*.wasm

	stellar contract optimize --wasm $(WASM_DIR)/*.wasm --out-dir $(WASM_DIR)/optimized

clean:
		cargo clean

target:
		rustup target add $(WASM_TARGET)
