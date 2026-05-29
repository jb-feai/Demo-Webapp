<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('price_cents')->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('category')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_promoted')->default(false);
            $table->timestamps();

            $table->index('category');
            $table->index('is_promoted');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
